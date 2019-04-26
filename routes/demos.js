const path = require('path');
const async = require('async');
const Project = require('../models/project');
const fs = require('fs');
const fse = require('fs-extra');
const authenticateAsAnonymous = require('../libs/util').authenticateAsAnonymous;

module.exports = function (express) {
  var router = express.Router();
  router.get('/:name/:profile/:majorVersion.:minorVersion/:type',
    authenticateAsAnonymous,
    (req, res) => {
      let projectId;
      async.waterfall([

        // Create new project.
        callback => {
          const newProject = new Project();
          newProject.name = req.params.name;
          newProject.user = req.user._id;
          newProject.created = new Date();
          newProject.profile = req.params.profile;
          newProject.version = req.params.majorVersion + '.' + req.params.minorVersion;
          newProject.type = req.params.type;
          newProject.save((error, project) => {
            if (error) {
              return callback(error);
            }
            callback(null, project);
          });
        },

        // Create project's dir in demos folder.
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

        // Copy requested demo to the project.
        (project, projectPath, callback) => {
          // TODO: take the sample from external url.
          const samplePath = path.join(process.cwd(), 'sample', project.type, project.name);
          fse.copy(samplePath, projectPath, function (err) {
            if (err) {
              return callback(err);
            }
            callback(null, project);
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
          console.log(JSON.stringify(state));
          fs.writeFile(path.join(supportPath, 'state.json'), JSON.stringify(state), () => callback(null, project, supportPath));
        },

        // Add brackets.json to support folder.
        (project, supportPath, callback) => {
          console.log("6");
          const brackets = require(path.join(process.cwd(), 'models', 'brackets.json'));
          fs.writeFile(path.join(supportPath, 'brackets.json'), JSON.stringify(brackets), () => res.redirect('/brackets/' + projectId));
        }
      ], error => {
          if (error) {
            res.status(400).send('Can not open demo. ' + error);
          }
        }
    )
  });
  return router;
};
