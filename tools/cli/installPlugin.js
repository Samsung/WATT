/*global require, Promise*/
(function () {
  'use strict';

  const { exec } = require('child_process');
  const fs = require('fs-extra');
  const path = require('path');
  const stlib = require('./iotcloud-lib/stlib');

  const args = process.argv.slice(2);
  const cwd = process.cwd();
  const bracketsProject = args[0];
  const projectName = 'smartthings';
  const stCmd = path.join(__dirname, 'st');
  const allProjectsPath = path.join(cwd.replace('tools/cli', ''), 'projects');
  const projectPath = path.join(allProjectsPath, bracketsProject);
  const distPath = path.join(projectPath, 'dist');
  const devicePluginVersion = '0.0.1';
  const stProjectPath = path.join(distPath, projectName);
  const ppkPath = path.join(stProjectPath, 'out', `${bracketsProject}_${devicePluginVersion}.ppk`);
  const passwd = 'test2test';

  const runSt = args =>
    new Promise((resolve, reject) => {
      try {
        exec(`node ${stCmd} ${args}`, (err, stdout) =>
          err ? reject(err) : resolve(stdout ? stdout : undefined));
      } catch (err) {
        reject(err);
      }
    });

  const refreshDistFolder = () =>
    fs.remove(distPath)
      .then(() => fs.mkdir(distPath));

  const removeDir = dirPath => fs.remove(dirPath)
    .catch(() => console.log(`Unable to remove ${dirPath}`));

  const copyProjectToDist = () => {
    const pluginPath = path.join(stProjectPath, 'plugin');
    const tmpDir = '/tmp/project';

    return fs.copy(projectPath, tmpDir, { filter: (src, dest) => !/dist/.test(src) })
      .then(() => fs.copy(tmpDir, pluginPath, { overwrite: true }))
      .catch(err => {
        removeDir(tmpDir);
        return Promise.reject(err);
      })
      .then(() => removeDir(tmpDir));
  };

  const getDeviceProfile = () => {
    const projectStateJsonPath = path.join(allProjectsPath, 'support', bracketsProject, 'state.json');
    const projectStateJson = require(projectStateJsonPath);
    const deviceProfile = projectStateJson.deviceProfiles[projectStateJson.projectPath + 'index.html'];
    if (!deviceProfile) {
      throw new Error('No device profile created for index.html');
    }
    return deviceProfile;
  };

  const writeDeviceProfile = deviceProfileData =>
    fs.writeFile(path.join(stProjectPath, 'device-profile.json'), JSON.stringify(deviceProfileData, null, ' '))
      .catch(() => {
        throw new Error('Saving device profile failed');
      });

  const setAdbPath = () => {
    var config = new stlib.Configurator('~/.smartThings/system/config.json');
    config.init();
            // @todo: get from CMD> whereis adb
    config.set('adbPath', '/usr/bin');
    config.save();
  };

  const getConnectedDevices = () => {
    return new Promise((resolve, reject) => {
      try {
        exec('adb devices', (err, stdout) => {
          if (err) {
            return reject(new Error('Unable to get exec adb devices'));
          }
          const result = stdout.match(/^([0-9a-z]+)\sdevice/m);
          if (result) {
            result.shift();
          }
          resolve(result);
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  const selectDevice = devices =>
    (devices && devices.length)
      ? devices.shift()
      : Promise.reject(new Error('device not connected to PC'));

  runSt('refresh-token')
    .catch(() => runSt('request-token --show-ui'))
    .then(() => runSt(`request ppk-crt --passwd ${passwd}`))
    .then(refreshDistFolder)
    .then(() => process.chdir(distPath))
    .then(() => runSt(`create project -n ${projectName} --generate-plugin --plugin-id ${bracketsProject}`))
    .then(copyProjectToDist)
    .then(getDeviceProfile)
    .then(deviceProfileData => writeDeviceProfile(deviceProfileData))
    .then(() => runSt(`build project --project-path ${stProjectPath}`))
    .then(() => runSt(`sign ppk --in ${ppkPath} --passwd ${passwd}`))
    .then(() => runSt(`verify ppk --in ${ppkPath} --verbose`))
    .then(() => setAdbPath())
    .then(() => process.chdir(projectName))
    .then(getConnectedDevices)
    .then(devices => selectDevice(devices))
    .then(device => runSt(`install app --target --serial ${device}`))
    .then(() => process.chdir(cwd))
    .catch(err =>
      process.stderr.write(
        `Fail during project installation: ${(err && err.message) ? err.message : err}`,
        () => process.exit(1)));
}());
