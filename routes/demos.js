const path = require('path');
const async = require('async');
const Project = require('../models/project');
const exec = require('child_process').exec;
const fs = require('fs');
const fse = require('fs-extra');
const config = require('config');
const authenticateAsAnonymous = require('../libs/util').authenticateAsAnonymous;

module.exports = function (express) {
  var router = express.Router();
  router.get('/*',
    authenticateAsAnonymous,
    (req, res) => {
      let projectId;
      async.waterfall([

        // Create new project.
        callback => {
          const newProject = new Project();
          newProject.name = "Tau Sample Demo";
          newProject.type = "web";
          newProject.user = req.user._id;
          newProject.created = new Date();
          // FIXME: take them from config.xml
          newProject.profile = "";
          newProject.version = "";
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
          if (!tauExamplesHost || !samplePath)
            return callback(`Could not resolve path: ${tauExamplesHost}${samplePath}`);

          const sampleUrl = new URL(samplePath, tauExamplesHost);
          // Define number of unnecessary directories to be omitted while downloading.
          const numDirsToCut = sampleUrl.pathname.match(/TAU\/examples\/mobile|werable\/UIComponents/g) ? 4 : 0;
          exec(`wget --page-requisites --convert-links --no-host-directories --cut-dirs=${numDirsToCut} --directory-prefix ${projectPath} ${sampleUrl}`, (error, stdout, stderr) => {
            if (error) {
              console.log(error);
              // FIXME: background-image's url from tau.css references file that
              // does not exist on server. Uncomment line below once it's fixed.
              // return callback(error);
            }
            callback(null, projectPath);
          });
        },

        // Create support folder.
        (project, callback) => {
          const supportPath = path.join(process.cwd(), 'projects', 'support', projectId);
          fse.ensureDir(supportPath, function (error) {
            if (error) {
              return callback(error);
            }
            callback(null, project, supportPath);
          });
        },

        // Add state.json to support folder.
        (project, supportPath, callback) => {
          const state = require(path.join(process.cwd(), 'models', 'state.json'));
          state.projectId = projectId;
          state.projectName = project.name;
          state.projectType = project.type;
          state.projectProfile = project.profile;
          state.projectVersion = project.version;
          state.projectExtension = "";
          fs.writeFile(path.join(supportPath, 'state.json'), JSON.stringify(state), () => callback(null, project, supportPath));
        },

        // Add brackets.json to support folder.
        (project, supportPath, callback) => {
          const brackets = require(path.join(process.cwd(), 'models', 'brackets.json'));
          fs.writeFile(path.join(supportPath, 'brackets.json'), JSON.stringify(brackets), () => res.redirect('/brackets/' + projectId));
        }
      ], error => {
          if (error) {
            res.status(400).send('Can not open demo. ' + error);
          }
      })
    }
  );
  return router;
};
