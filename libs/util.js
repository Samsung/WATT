var config = require('config');
var debug = require('debug')('libs:util');
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
}
