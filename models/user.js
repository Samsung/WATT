var debug = require('debug')('models:user');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

// define the schema for the user model
var user = new Schema({
  local: {
    email     : String,
    password  : String,
    certificate : {
      data : {
        type : Buffer,
        default : null,
      },
      password : {
        type : String,
        default : '',
      },
      alias : {
        type : String,
        default : '',
      },
      country : {
        type : String,
        default : '',
      },
      city : {
        type : String,
        default : '',
      },
      email : {
        type : String,
        default : '',
      },
      name : {
        type : String,
        default : '',
      },
      organization : {
        type : String,
        default : '',
      },
      state : {
        type : String,
        default : '',
      },
      unit : {
        type : String,
        default : '',
      },
    }
  },
  pwe: {
    id  : String
  }
});

// methods
// generating a hash
user.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
user.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', user);