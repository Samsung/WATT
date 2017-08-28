var async = require('async');
var debug = require('debug')('routes:pwe');

var User = require('../models/user');

module.exports = function(express) {
  var router = express.Router();

  router.get('/:userId' ,function(req, res) {
    var userId = req.params.userId;

    async.waterfall([
      function(callback) {
        // Find the pwe user id in the WATT db
        User.findOne({ 'pwe.id': userId }, function(findError, user) {
          if (findError) {
            return callback(findError);
          }

          if (!user) {
            // If there is no signed user, create new user
            // and save the pwe user id.
            var newUser = new User();

            newUser.pwe.id = userId;

            newUser.save(function(saveError, savedUser) {
              if (saveError) {
                return callback(saveError);
              }

              callback(null, savedUser);
            });
          } else {
            // If there is signed user, pass the user data
            // to the next callback
            callback(null, user);
          }
        });
      }, function(user, callback) {
        // Try to log in using passed user data
        req.login(user, function(error) {
          if (error) {
            return callback(error);
          }

          callback(null);
        });
      }
    ], function(error) {
      if (error) {
        debug(error);
        return res.status(400).send(error);
      }

      // Redirect url to the 'project' if there is no error
      res.redirect('/project');
    });
  });

  return router;
};