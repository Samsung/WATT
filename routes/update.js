var async = require('async');
var debug = require('debug')('routes:update');
var fs = require('fs');
var fse = require('fs-extra');
var imageToUri = require('image-to-uri');
var path = require('path');

var util = require('../libs/util');
var Project = require('../models/project');

module.exports = function(express) {
  var router = express.Router();

  router.get('/', util.isLoggedIn, function(req, res) {
    var user = req.user;

    Project.find({ 'user' : user._id }, function(err, projects) {
      if (err) {
        debug(err);
        return res.status(400).send(err);
      }

      res.render('parts/projectlist', {
        projects : projects
      });
    });
  });

  router.post('/template', function(req, res) {
    var data = req.body;

    // Check the type of project data whether it is correct
    if (typeof data !== 'object' ||
        typeof data.format !== 'string' ||
        typeof data.type !== 'string') {
      return res.status(400).send('Project data is wrong');
    }

    var projectFormat = data.format;
    var projectType = data.type;
    var templateDir = path.join(process.cwd(), projectFormat);
    var templates = [];

    async.waterfall([
      function(callback) {
        fse.ensureDir(templateDir, function(error) {
          if (error) {
            return callback(error);
          }

          var items = require(path.join(templateDir, 'list.json'));
          callback(null, items);
        });
      },
      function(items, callback) {
        items.forEach(function(item) {
          if (projectType !== item.type) {
            return;
          }

          let template = {
            name: item.name,
            description: item.description,
            src: item.src
          };

          if (item.icon) {
            var imageSrc = path.join(templateDir, projectType, item.src, item.icon);
            if (fs.existsSync(imageSrc)) {
              template.icon = imageToUri(imageSrc);
            }
          }

          if (item.language) {
            template.language = item.language;
          }

          templates.push(template);
        });

        callback(null);
      }
    ], function(error) {
      if (error) {
        return res.status(400).send(error);
      }

      res.render('parts/templatelist', {
        projectFormat: projectFormat,
        templates: templates
      });
    });
  });

  return router;
};