var async = require('async');
var debug = require('debug')('routes:import');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var unzip = require('decompress-unzip')();

var util = require('../libs/util');
var Project = require('../models/project');

module.exports = function(express) {
  var router = express.Router();

  router.put('/archive', util.isLoggedIn, function(req, res) {
    var user = req.user;
    var data = req.body;

    // Check the type of project data whether it is correct
    if (typeof data !== 'object' ||
        typeof data.name !== 'string' ||
        typeof data.description !== 'string' ||
        typeof data.archive !== 'string') {
      return res.status(400).send('Project data is wrong');
    }

    var projectId;
    var projectPath;
    var supportPath;

    async.waterfall([
      function(callback) {
        // Find user's project using user ID
        Project.find({'user': user._id}, function(error, projects) {
          if (error) {
            return callback(error);
          }

          // Check duplicated project name
          for (var i=0; i<projects.length; i++) {
            if (projects[i].name === data.name) {
              return callback('Duplicated project name.');
            }
          }

          callback(null);
        });
      },
      function(callback) {
        // Create new project
        var newProject = new Project();

        newProject.name = data.name;
        newProject.user = user._id;
        newProject.created = new Date();
        // FIXME: We should parse the config.xml in the archive file and
        // add the information to the database. (profile, version)
        newProject.type = 'web';
        newProject.description = data.description;

        newProject.save(function(error, project) {
          if (error) {
            return callback(error);
          }

          callback(null, project);
        });
      },
      function(project, callback) {
        // Create the project folder
        projectId = project._id.toString();
        projectPath = path.join(process.cwd(), 'projects', projectId);

        fse.ensureDir(projectPath, function(error) {
          if (error) {
            return callback(error);
          }

          callback(null);
        });
      },
      function(callback) {
        // Create project support folder
        supportPath = path.join(process.cwd(), 'projects', 'support', projectId);
        fse.ensureDir(supportPath, function(error) {
          if (error) {
            return callback(error);
          }

          var state = require(path.join(process.cwd(), 'models', 'state.json'));
          state.projectId = projectId;
          state.projectName = data.name;
          fs.writeFile(path.join(supportPath, 'state.json'), JSON.stringify(state), callback);
        });
      },
      function(callback) {
        // Unzip archive file
        var fileList = [];
        var buffer = new Buffer(data.archive, 'binary');
        unzip(buffer).then(function(files) {
          // If there is no file, it would be error
          if (files.length === 0) {
            return callback('unzip error');
          }

          async.each(files, function(file, cb) {
            debug(file);
            if (file.type === 'directory') {
              fse.ensureDir(path.join(projectPath, file.path), function(error) {
                if (error) {
                  return cb(error);
                }

                cb();
              });
            } else {
              fse.ensureFile(path.join(projectPath, file.path), function(error) {
                fileList.push(file);
                cb();
              });
            }
          }, function(error) {
            if (error) {
              return callback(error);
            }

            callback(null, fileList);
          });
        }).catch(function(error) {
          if (error) {
            callback(error);
          }
        });
      },
      function(fileList, callback) {
        // Write unzipped files to project folder
        async.each(fileList, function(file, cb) {
          fs.open(path.join(projectPath, file.path), 'w', function(error, fd) {
            if (error) {
              debug(error);
              return cb(error);
            }

            fs.write(fd, file.data, 0, file.data.length, null, function(writeError) {
              if (writeError) {
                debug(writeError);
                return cb(writeError);
              }

              fs.close(fd, function(closeError) {
                if (closeError) {
                  return cb(closeError);
                }

                cb();
              });
            });
          });
        }, function(error) {
          if (error) {
            return callback(error);
          }

          callback(null);
        });
      }
    ], function(error) {
      if (error) {
        // Remove project database if adding project failed
        if (projectId) {
          Project.remove({'_id': projectId }, function(removeError) {
            if (removeError) {
              debug(removeError);
            }
          });
        }

        // Remove project folder if adding project failed
        if (projectPath) {
          fse.remove(projectPath, function(removeError) {
            if (removeError) {
              debug(removeError);
            }
          });
        }

        // Remove project support folder if adding project failed
        if (supportPath) {
          fse.remove(supportPath, function(removeError) {
            if (removeError) {
              debug(removeError);
            }
          });
        }

        return res.status(400).send(error);
      }

      res.send();
    });
  });

  return router;
};