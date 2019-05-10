var config = require('config');
var debug = require('debug')('libs:util');
var fs = require('fs');
var xml2js = require('xml2js');
var path = require('path');
var User = require('../models/user');

exports.isLoggedIn = function (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('/');
};

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/project');
  }

  return next();
};

// This is needed to allow opening WATT samples without user authentication.
exports.authenticateAsAnonymous = function(req, res, next) {
  // Find anonymous user.
  const annonymousEmail = "annonymoususer@watt.com";
  User.findOne({ 'local.email' : annonymousEmail }, function(err, user) {
    if (err) {
      res.status(404).send('Can not find anonymous user: ' + JSON.stringify(err));
      return;
    }

    // If anonymous user does not exist, create it.
    if (!user) {
      user = new User();
      user.local.email = annonymousEmail;
      user.local.password = user.generateHash("pass");
      user.save(function(err) {
        if (err) {
          res.status(404).send('Can not create anonymous user: ' + JSON.stringify(err));
          return;
        }
        authenticateUser(req, res, next, user);
      });
    } else {
      // authenticate anonymous user.
      authenticateUser(req, res, next, user);
    }
  });
};

function authenticateUser(req, res, next, user) {
  req.login(user, function(err) {
    if (err) {
      res.status(404).send('Can not login: ' + JSON.stringify(err));
      return;
    }
    next();
  });
};

exports.createConfigXML = function(dstPath, configPreferences, configContent, callback) {
  const configName = configPreferences.sthingsSupport ? 'config_sthings.xml' : 'config.xml';
  fs.readFile(path.join(process.cwd(), 'models', configName), function (error, config) {
    if (error) {
      return callback(error);
    }

    const parser = new xml2js.Parser();
    parser.parseString(config, function (parseError, result) {
      if (parseError) {
        return callback(parseError);
      }

      const widget = result.widget;

      widget.name[0] = configContent.name;
      widget['tizen:application'][0]['$'].package = configContent.id;
      widget['tizen:application'][0]['$'].id = [configContent.id, configContent.name].join('.');
      widget['tizen:application'][0]['$']['required_version'] = configContent.requiredVersion;
      widget['content'][0]['$'].src = configContent.contentSrc || 'index.html';
      widget['icon'][0]['$'].src = configContent.iconSrc || '';
      widget['$'].id = 'http://yourdomain/' + configContent.name;
      widget['tizen:profile'][0]['$'].name = configContent.profile;
      if (configPreferences.sthingsSupport) {
        widget['tizen:privilege'][0]['$'].name = 'http://tizen.org/privilege/internet';
      }

      const builderOption = {
        xmldec: {
          'version': '1.0',
          'encoding': 'UTF-8'
        }
      };

      const builder = new xml2js.Builder(builderOption);
      const xml = builder.buildObject(result);
      fs.writeFile(path.join(dstPath, 'config.xml'), xml, callback);
    });
  });
};
