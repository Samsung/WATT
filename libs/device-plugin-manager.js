const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const cwd = process.cwd();

const runSt = args =>
  new Promise((resolve, reject) => {
    try {
      exec(`node ${path.join(cwd, 'tools', 'cli', 'st')} ${args}`, (err, stdout) =>
        err ? reject(err) : resolve(stdout ? stdout : undefined));
    } catch (err) {
      reject(err);
    }
  });

const mapCapabilities = capabilities =>
  new Promise((resolve, reject) => {
    const capabilitiesMap = require(path.join(cwd, 'tools', 'sthings', 'src', 'core', 'capabilities.map.json'));
    const capabilitiesMissing = capabilities.filter(c => !capabilitiesMap[c]);
    if (capabilitiesMissing.length !== 0) {
      reject(new Error('Can not find replacment for capabilities: ' + capabilitiesMissing.reduce((acc, cur) => acc + ' ' + cur)));
      return;
    }
    const mappedCapabilities = capabilities.map(c=> ({ 'id': capabilitiesMap[c] }));
    resolve(mappedCapabilities);
  });

const createDeviceProfileData = (deviceName, deviceCapabilities, vendorId) =>
  ({
    'name': deviceName,
    'components': [
      {
        'id': 'main',
        'capabilities': deviceCapabilities
      }
    ],
    'metadata': {
      'deviceType': 'Others',
      'vid': vendorId
    }
  });

const writeDeviceProfile = (deviceProfileData, deviceProfilePath) =>
  new Promise((resolve, reject) => {
    fs.writeFile(
      deviceProfilePath, JSON.stringify(deviceProfileData, null, ' '),
      err => err ? reject(err) : resolve());
  });

const publishDeviceSt = (deviceName, deviceProfilePath) =>
  runSt(`publish device --name "${deviceName}" --device-profile-path ${deviceProfilePath}`)
    .then((stdout) => {
      if (!stdout) {
        throw new Error('Publish command did not return data');
      }
      try {
        // Get remove first log line getting only result json string
        return JSON.parse(stdout.substring(stdout.indexOf('\n') + 1));
      } catch (err) {
        throw new Error(`Publish command returned unknown output: ${stdout}`);
      }
    });

const rethrow = (err, msg) => {
  console.log(`${msg}: ${err.message}`);
  throw new Error(msg);
};

const authenticateSt = () =>
  runSt('refresh-token')
    .catch(() => runSt('request-token --show-ui')
      .catch(err => rethrow(err, 'Authentication failed')));

const createDeviceProfile = (deviceName, capabilities, projectId) =>
  mapCapabilities(capabilities)
    .then(mappedCapabilities => createDeviceProfileData(deviceName, mappedCapabilities, projectId))
    .catch(err => rethrow(err, 'Unable to create device profile'));

const prepareDir = (projectId, filePath) =>
  new Promise((resolve, reject) => {
    const dirPath = path.join('/tmp', 'WATT', projectId, filePath);
    fs.ensureDir(dirPath, err => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });

const publishDevice = (projectId, filePath, deviceName, deviceProfileData) =>
  prepareDir(projectId, filePath)
    .then(dirPath => {
      const deviceProfilePath = path.join(dirPath, 'device-profile.json');
      return writeDeviceProfile(deviceProfileData, deviceProfilePath)
        .then(() => publishDeviceSt(deviceName, deviceProfilePath));
    })
    .catch(err => rethrow(err, 'Unable to publish device'));

exports.createDevice = function(projectId, filePath, deviceName, capabilities) {
  return authenticateSt()
    .then(() => createDeviceProfile(deviceName, capabilities, projectId))
    .then(deviceProfileData => publishDevice(projectId, filePath, deviceName, deviceProfileData)
      .then(publishResult => ({
        id: publishResult.id,
        profile: deviceProfileData,
      })));
};
