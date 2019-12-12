var async = require('async');
var debug = require('debug')('routes:export');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var xml2js = require('xml2js');

var util = require('../libs/util');

module.exports = function(express) {
  var router = express.Router();

  router.post('/web', util.isLoggedIn, function(req, res) {
    var user = req.user;
    var data = req.body;

    // Check the type of project id whether it is correct
    if (typeof data !== 'object' || typeof data.projectId !== 'string') {
      return res.status(400).send('Project id is wrong');
    }

    var projectPath, tempPath;
    var projectId = data.projectId;

    async.waterfall([
      function(callback) {
        // Check project folder whether it is existed
        projectPath = path.join(process.cwd(), 'projects', projectId);
        fs.stat(projectPath, callback);
      },
      function(stat, callback) {
        // Copy project folder to temp folder
        if (stat.isDirectory()) {
          var tempPath = path.join(process.cwd(), 'temp', projectId);
          fse.copy(projectPath, tempPath, function(err) {
            if (err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        } else {
          callback('Project path is wrong');
        }
      }
    ], function(error) {
      if (error) {
        if (tempPath) {
          // Remove tempPath when you fail to copy project folder
          fse.remove(tempPath, function(removeError) {
            if (removeError) {
              console.error(removeError);
            }
          });
        }
        res.status(400).send(error);
        return;
      }
      res.send(projectId);
    });
  });

  router.post('/share', util.isLoggedIn, function(req, res) {
    var user = req.user;
    var data = req.body;

    // Check the type of project id whether it is correct
    if (typeof data !== 'object' ||
        typeof data.projectId !== 'string' ||
        typeof data.projectName !== 'string') {
      return res.status(400).send('Project id is wrong');
    }

    var projectPath, sharePath;
    var projectId = data.projectId;
    var projectName = data.projectName;

    async.waterfall([
      function(callback) {
        // Check project folder whether it is existed
        projectPath = path.join(process.cwd(), 'projects', projectId);
        fs.stat(projectPath, callback);
      },
      function(stat, callback) {
        // Copy project folder to share folder
        if (stat.isDirectory()) {
          sharePath = path.join(process.cwd(), 'share', projectName);
          fse.copy(projectPath, sharePath, function(err) {
            if (err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        } else {
          callback('Project path is wrong');
        }
      }
    ], function(error) {
      if (error) {
        if (sharePath) {
          // Remove sharePath when you fail to copy project folder
          fse.remove(sharePath, function(removeError) {
            if (removeError) {
              console.error(removeError);
            }
          });
        }
        res.status(400).send(error);
        return;
      }
      res.send(projectId);
    });
  });

  router.get('/tizen/:projectId', function(req, res) {
    var data = req.body;

    var projectPath;
    var projectId = req.params.projectId;

    async.waterfall([
      function(callback) {
        // Check project folder whether it is existed
        projectPath = path.join(process.cwd(), 'projects', projectId);
        fs.stat(projectPath, callback);
      },
      function(stat, callback) {
        if (stat.isDirectory()) {
          // Find config.xml
          var configPath = path.join(projectPath, 'config.xml');

          fs.readFile(configPath, callback);
        } else {
          callback('Project path is wrong');
        }
      },
      function(config, callback) {
        // Parse config xml to find project name
        var parser = new xml2js.Parser();
        parser.parseString(config, function(parseError, result) {
          if (parseError) {
            return callback(parseError);
          }

          var widget = result.widget;
          var projectName = widget.name[0];

          return callback(null, projectName);
        });
      }, function(projectName, callback) {
        var wgtName = projectName + '.wgt';
        var wgtPath = path.join(projectPath, wgtName);

        // Check the wgt file whether it is existed or not
        var isExisted = fs.existsSync(wgtPath);
        if (isExisted) {
          callback(null, wgtName);
        } else {
          callback('Not found wgt file');
        }
      }
    ], function(error, wgtName) {
      if (error) {
        return res.status(400).send(error);
      }

      // Send wgt information if existing the wgt file
      var wgtPath = path.join('projects', projectId, wgtName);
      res.send({
        name: wgtName,
        path: wgtPath
      });
    });
  });

  return router;
};
