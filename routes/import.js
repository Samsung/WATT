const async = require('async');
const debug = require('debug')('routes:import');
const extractZip = require('extract-zip');
const formidable = require('formidable');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const util = require('../libs/util');
const Project = require('../models/project');

module.exports = function(express) {
  const router = express.Router();

  router.put('/archive', util.isLoggedIn, function(req, res) {
    const user = req.user;
    const data = req.body;

    // Check the type of project data whether it is correct
    if (typeof data !== 'object' ||
        typeof data.name !== 'string' ||
        typeof data.description !== 'string') {
      return res.status(400).send('Project data is wrong');
    }

    let projectId, projectPath, supportPath;

    async.waterfall([
      (callback) => {
        // Find user's project using user ID
        Project.find({'user': user._id}, (error, projects) => {
          if (error) {
            return callback(error);
          }

          // Check duplicated project name
          for (let project of projects) {
            if (project.name === data.name) {
              return callback('Duplicated project name.');
            }
          }

          callback(null);
        });
      },
      (callback) => {
        // Create new project
        const newProject = new Project();

        newProject.name = data.name;
        newProject.user = user._id;
        newProject.created = new Date();
        // FIXME: We should parse the config.xml in the archive file and
        // add the information to the database. (profile, version)
        newProject.type = 'web';
        newProject.description = data.description;

        newProject.save((error, project) => {
          if (error) {
            return callback(error);
          }

          callback(null, project);
        });
      },
      (project, callback) => {
        // Create the project folder
        projectId = project._id.toString();
        projectPath = path.join(process.cwd(), 'projects', projectId);

        fse.ensureDir(projectPath, (error) => {
          if (error) {
            return callback(error);
          }

          callback(null);
        });
      },
      function(callback) {
        // Create project support folder
        supportPath = path.join(process.cwd(), 'projects', 'support', projectId);
        fse.ensureDir(supportPath, (error) => {
          if (error) {
            return callback(error);
          }

          let state = require(path.join(process.cwd(), 'models', 'state.json'));
          state.projectId = projectId;
          state.projectName = data.name;
          fs.writeFile(path.join(supportPath, 'state.json'), JSON.stringify(state), callback);
        });
      }
    ], (error) => {
      if (error) {
        // Remove project database if adding project failed
        if (projectId) {
          Project.remove({'_id': projectId }, (removeError) => {
            if (removeError) {
              debug(removeError);
            }
          });
        }

        // Remove project folder if adding project failed
        if (projectPath) {
          fse.remove(projectPath, (removeError) => {
            if (removeError) {
              debug(removeError);
            }
          });
        }

        // Remove project support folder if adding project failed
        if (supportPath) {
          fse.remove(supportPath, (removeError) => {
            if (removeError) {
              debug(removeError);
            }
          });
        }

        return res.status(400).send(error);
      }

      res.send(projectId);
    });
  });

  router.post('/archive/upload/:projectId', util.isLoggedIn, function(req, res) {
    const projectId = req.params.projectId;
    const user = req.user;

    let filePath, projectPath;

    async.waterfall([
      (callback) => {
        Project.find({'_id': projectId}, (err, projects) => {
          if (err) {
            return callback(err);
          }

          if (projects.length === 0) {
            return callback('Not found project');
          }

          const project = projects[0];
          if (project.user.toString() !== user._id.toString()) {
            return callback('Not user project');
          }

          callback(null);
        });
      },
      (callback) => {
        const form = new formidable.IncomingForm();

        projectPath = path.join(process.cwd(), 'projects', projectId);
        form.uploadDir = projectPath;

        form.on('file', (field, file) => {
          filePath = path.join(form.uploadDir, file.name);
          fs.rename(file.path, filePath);
        });

        form.on('error', (err) => {
          return callback('An error has occured: \n' + err);
        });

        form.on('end', () => {
          return callback(null);
        });

        form.parse(req);
      },
      (callback) => {
        extractZip(filePath, {dir: projectPath}, (err) => {
          if (err) {
            return callback(err);
          }

          fs.unlink(filePath, callback);
        });
      }
    ], function(error) {
      if (error) {
        debug(error);
        return res.status(400).send(error);
      }

      res.send();
    });
  });

  return router;
};