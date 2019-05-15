const path = require('path');
const async = require('async');
const Project = require('../models/project');
const exec = require('child_process').exec;
const fs = require('fs');
const fse = require('fs-extra');
const config = require('config');
const util = require('../libs/util');

module.exports = function (express) {
  var router = express.Router();
  router.get('/*',
    util.authenticateAsAnonymous,
    (req, res) => {
      let projectId;
      async.waterfall([

        // Create new project.
        callback => {
          const newProject = new Project();
          newProject.name = 'Tau Sample Demo';
          newProject.type = 'web';
          newProject.user = req.user._id;
          newProject.created = new Date();
          newProject.profile = req.query.path.includes('mobile') ? 'mobile' : 'wearable';
          newProject.version = '2.4';
          newProject.save((error, project) => {
            if (error) {
              return callback(error);
            }
            callback(null, project);
          });
        },

        // Create project's dir in projects folder.
        (project, callback) => {
          projectId = project._id.toString();
          const projectPath = path.join(process.cwd(), 'projects', projectId);
          fse.ensureDir(projectPath, function (error) {
            if (error) {
              return callback(error);
            }
            callback(null, project, projectPath);
          });
        },

        // Download requested demo to the project folder.
        (project, projectPath, callback) => {
          const tauExamplesHost = config.get('TAUExamplesHost');
          const samplePath = req.query.path;
          if (!tauExamplesHost || !samplePath) {
            return callback(`Could not resolve path: ${tauExamplesHost}${samplePath}`);
          }

          const sampleUrl = new URL(samplePath, tauExamplesHost);
          // Define number of unnecessary directories to be omitted while downloading.
          const numDirsToCut = sampleUrl.pathname.match(/TAU\/examples\/mobile|wearable\/UIComponents/g) ? 4 : 0;
          exec(`wget --page-requisites --convert-links --no-host-directories --cut-dirs=${numDirsToCut} --directory-prefix ${projectPath} ${sampleUrl}`, (error, stdout, stderr) => {
            if (error) {
              console.log(error);
              // FIXME: background-image's url from tau.css references file that
              // does not exist on server. Uncomment line below once it's fixed.
              // return callback(error);
            }
            callback(null, project, projectPath);
          });
        },

        // Add config.xml (Design Editor and Tizen Packaging require it).
        (project, projectPath, callback) => {
          const isMobileProfile = req.query.path.includes('mobile');
          const isWerableProfile = req.query.path.includes('wearable');
          const componentMobile = path.join('mobile', 'UIComponents');
          const componentWerable = path.join('wearable', 'UIComponents');

          util.createConfigXML(projectPath,
            {
              sthingsSupport: false
            },
            {
              id: projectId.substring(0, 10),
              name: project.name,
              // cut {mobile|wearable}/UIComponents from path since it was omitted in wget command, + 1 is for skipping leading path separator.
              contentSrc: req.query.path.substring(isMobileProfile ? componentMobile.length + 1 : isWerableProfile ? componentWerable.length + 1 : 0),
              profile: project.profile,
              requiredVersion: project.version,
            }, (error) => {
              if (error) {
                return callback(error);
              }
              callback(null, project, projectPath);
            });
        },

        // Create support folder.
        (project, projectPath, callback) => {
          const supportPath = path.join(process.cwd(), 'projects', 'support', projectId);
          fse.ensureDir(supportPath, function (error) {
            if (error) {
              return callback(error);
            }
            callback(null, project, projectPath, supportPath);
          });
        },

        // Add state.json to support folder.
        (project, projectPath, supportPath, callback) => {
          const state = require(path.join(process.cwd(), 'models', 'state.json'));
          state.projectId = projectId;
          state.projectName = project.name;
          state.projectType = project.type;
          state.projectProfile = project.profile;
          state.projectVersion = project.version;
          state.projectExtension = '';
          fs.writeFile(path.join(supportPath, 'state.json'), JSON.stringify(state), () => callback(null, supportPath));
        },

        // Add brackets.json to support folder.
        (supportPath, callback) => {
          const brackets = require(path.join(process.cwd(), 'models', 'brackets.json'));
          fs.writeFile(path.join(supportPath, 'brackets.json'), JSON.stringify(brackets), () => res.redirect('/brackets/' + projectId));
        }
      ], error => {
        if (error) {
          res.status(400).send('Can not open demo. ' + error);
        }
      });
    }
  );
  return router;
};
