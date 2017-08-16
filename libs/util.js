var config = require('config');
var debug = require('debug')('libs:util');

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