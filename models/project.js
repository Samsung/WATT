var debug = require('debug')('models:project');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define the schema for the user model
var project = new Schema({
  name : String,
  user : ObjectId,
  created : Date,
  profile : String,
  version : String,
  type : String,
  description: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Project', project);