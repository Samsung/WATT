const path = require('path');
const async = require('async');
const Project = require('../models/project');
const exec = require('child_process').exec;
const fs = require('fs');
const fse = require('fs-extra');
const config = require('config');
const util = require('../libs/util');

let projectsDeletionInProgress = false;

function canCreateAnonymousProject(req, res, next) {
  const anonymousProjectsLimit = config.get('AnonymousProjectsLimit');
  Project.find({'user': req.user._id}, function (err, anonymousProjects) {
    if (err) {
      return res.status(400).send(err);
    }

    if (anonymousProjects.length >= anonymousProjectsLimit) {
      tryDeleteOutDatedProjects(anonymousProjects, function(didDelete) {
        if (didDelete) {
          next();
        } else {
          return res.status(400).send('No possible to create more demos. Please try again later.');
        }
      });
    } else {
      next();
    }
  });
};

function tryDeleteOutDatedProjects(projects, completionCallback) {
  let numberDeletedPojects = 0;
  if (projectsDeletionInProgress) {
    console.log('Anonymous projects are being deleted ...');
    return completionCallback(numberDeletedPojects);
  }

  function isProjectOutDated(project) {
    const deprecationAge = config.get('AnonymousProjectsDeprecationAgeInMinutes');
    const projectCreatedDatePlusDeprecationAge = new Date(project.created);
    projectCreatedDatePlusDeprecationAge.setMinutes(projectCreatedDatePlusDeprecationAge.getMinutes() + deprecationAge);
    return projectCreatedDatePlusDeprecationAge <= Date.now();
  }

  const outDatedProjects = projects.filter(isProjectOutDated);
  if (outDatedProjects.length === 0) {
    return completionCallback(numberDeletedPojects);
  }

  projectsDeletionInProgress = true;
  let numberHandledPojects = 0;

  outDatedProjects.forEach(function(project) {
    async.waterfall([
      function (callback) {
        // Remove the project using projectId
        Project.remove({'_id': project._id}, function (error) {
          if (error) {
            return callback(error);
          }
          callback(null);
        });
      },
      function (callback) {
        // Remove the project folder
        var projectPath = path.join(process.cwd(), 'projects', project._id.toString());
        fse.remove(projectPath, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      },
      function (callback) {
        // Remove the project support folder
        var supportPath = path.join(process.cwd(), 'projects', 'support', project._id.toString());
        fse.remove(supportPath, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      }
    ], function (error) {
      numberHandledPojects++;
      if (error) {
        console.error(error);
      } else {
        // We treat project as deleted if it's successfully removed from db and
        // project folder and its support folder are removed as well.
        numberDeletedPojects++;
      }
      if (numberHandledPojects === outDatedProjects.length) {
        projectsDeletionInProgress = false;
        console.log('Finished deleting anonymous projects');
        return completionCallback(numberDeletedPojects);
      }
    });
  });
};

module.exports = function (express) {
  var router = express.Router();
  router.get('/*',
    util.authenticateAsAnonymous,
    canCreateAnonymousProject,
    (req, res) => {
      let projectId;
      async.waterfall([

        // Create new project.
        callback => {
          const newProject = new Project();
          newProject.name = 'Tau Sample Demo';
          newProject.type = 'demo';
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
          // check if url is valid, spider option doesn't download anything
          exec(`wget --spider ${sampleUrl}`, (error, stdout, stderr) => {
            if (error) {
              console.log(error);
              return callback(`Could not download sample from ${sampleUrl}`);
            }
            else {
              // Define number of unnecessary directories to be omitted while downloading.
              const numDirsToCut = sampleUrl.pathname.match(/TAU\/examples\/mobile|wearable\/UIComponents/g) ? 4 : 0;
              exec(`wget --recursive --page-requisites --convert-links --no-host-directories --cut-dirs=${numDirsToCut} --directory-prefix ${projectPath} ${sampleUrl}`, (error, stdout, stderr) => {
                if (error) {
                  // we don't return here because there may be samples with not existing resources
                  console.log(error);
                }
                callback(null, project, projectPath);
              });
            }
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
