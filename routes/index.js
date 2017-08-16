var debug = require('debug')('routes:index');

var util = require('../libs/util');

module.exports = function(express, passport) {
  var router = express.Router();

  router.get('/', util.isAuthenticated, function(req, res) {
    res.render('index');
  });

  // show the login form
  router.get('/login', util.isAuthenticated, function(req, res) {
    res.render('login', { message: req.flash('loginMessage') });
  });

  // process the login form
  router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/project',
    failureRedirect : '/login',
    failureFlash : true
  }));

  // show signup form
  router.get('/signup', util.isAuthenticated, function(req, res) {
    res.render('signup', { message: req.flash('signupMessage') });
  });

  // process the signup form
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/project',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  // logout
  router.get('/logout', function(req, res) {
    if (req.isAuthenticated()) {
      req.logout();
    }

    res.redirect('/');
  });

  return router;
};