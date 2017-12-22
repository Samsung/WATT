const debug = require('debug')('models:project');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// define the schema for the user model
const project = new Schema({
  name : String,
  user : ObjectId,
  created : Date,
  updated : Date,
  profile : String,
  version : String,
  type : String,
  description: String
});

project.pre('save', function(next) {
  this.updated = new Date();
  next();
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Project', project);