process.env.NODE_ENV = 'test';

var async = require('async');
var debug = require('debug')('test');
var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');
var mongoose = require('mongoose');
var path = require('path');

var Project = require('../models/project');
var server = require('../app.js');
var User = require('../models/user');

var should = chai.should();

chai.use(chaiHttp);

describe('routes/project.js Unit Test', function() {
  var agent = chai.request.agent(server);
  var projectId;
  // Test project data
  var testProject = {
    name: 'test',
    format: 'sample',
    type: 'web',
    templateName: 'HelloWorld',
    profile: 'mobile',
    version: '4.0',
    description: 'test project'
  };

  before(function(done) {
    // Remove all projects before starting test
    Project.remove({}, function(error) {
      if (error) {
        done(error);
        return;
      }

      // Login before starting test
      agent.post('/login')
        .send({email: 'test@samsung.com', password: 'test'})
        .end(function(loginError, res) {
          if (loginError) {
            done(loginError);
          } else {
            done();
          }
        });
    });
  });

  describe('PUT /project', function() {
    it('it should add project', function(done) {
      async.waterfall([
        function(callback) {
          // Request to create new project
          agent
            .put('/project')
            .send(testProject)
            .then(function(res) {
              res.should.have.status(200);

              // Save returned project ID
              res.text.should.be.a('string');
              projectId = res.text;

              callback(null);
            }, function(error) {
              if (error) {
                callback(error);
              }
            });
        },
        function(callback) {
          // Check the project whether it is saved correctly
          Project.find({'_id': projectId}, function(error, projects) {
            if (error) {
              callback(error);
            }

            // Found project should be array and length is one
            projects.should.be.a('array');
            projects.should.have.lengthOf(1);

            // Check the object whether it is same with testProject
            var project = projects[0];
            project.should.be.a('object');
            project.name.should.a('string');
            project.name.should.equal(testProject.name);
            project.type.should.a('string');
            project.type.should.equal(testProject.type);
            project.profile.should.a('string');
            project.profile.should.equal(testProject.profile);
            project.version.should.a('string');
            project.version.should.equal(testProject.version);
            project.description.should.a('string');
            project.description.should.equal(testProject.description);

            callback(null);
          });
        },
        function(callback) {
          // Check the project folder whether it is created correctly
          var projectPath = path.join(process.cwd(), 'projects', projectId);
          if (fs.existsSync(projectPath)) {
            callback(null);
          } else {
            callback('Project folder is not existed.');
          }
        }, function(callback) {
          // Check the support folder whether it is created correctly
          var supportPath = path.join(process.cwd(), 'projects', 'support', projectId);
          if (fs.existsSync(supportPath)) {
            callback(null);
          } else {
            callback('Support folder is not existed.');
          }
        }
      ], function(error) {
        if (error) {
          debug(error);
          done(error);
        } else {
          done();
        }
      });
    });
  });

  describe('GET /project', function() {
    it('it should get projects', function(done) {
      async.waterfall([
        function(callback) {
          // Request to get projects
          agent
            .get('/project')
            .then(function(res) {
              res.should.have.status(200);

              var projects = res.body;

              // project should be the array and one
              projects.should.be.a('array');
              projects.should.have.lengthOf(1);

              // Check the object whether it is same with testProject
              var project = projects[0];
              project.should.be.a('object');
              project.name.should.a('string');
              project.name.should.equal(testProject.name);
              project.type.should.a('string');
              project.type.should.equal(testProject.type);
              project.profile.should.a('string');
              project.profile.should.equal(testProject.profile);
              project.version.should.a('string');
              project.version.should.equal(testProject.version);
              project.description.should.a('string');
              project.description.should.equal(testProject.description);

              callback(null);
            }, function(error) {
              if (error) {
                callback(error);
              }
            });
        }
      ], function(error) {
        if (error) {
          done(error);
        } else {
          done();
        }
      });
    });
  });

  describe('POST /project/:projectId', function() {
    it('it should edit project', function(done) {
      async.waterfall([
        function(callback) {
          // Changed the values of testProject
          testProject.name = 'Hello';
          testProject.profile = 'wearable';
          testProject.version = '3.0';
          testProject.description = 'hello world test';

          // Request to edit project
          agent
            .post('/project/'+projectId)
            .send(testProject)
            .then(function(res) {
              res.should.have.status(200);

              // Check the project data whether it is same with the modified data
              var project = res.body;
              project.should.be.a('object');
              project.name.should.a('string');
              project.name.should.equal(testProject.name);
              project.profile.should.a('string');
              project.profile.should.equal(testProject.profile);
              project.version.should.a('string');
              project.version.should.equal(testProject.version);
              project.description.should.a('string');
              project.description.should.equal(testProject.description);

              callback(null);
            }, function(error) {
              if (error) {
                callback(error);
              }
            });
        }
      ], function(error) {
        if (error) {
          debug(error);
          done(error);
        } else {
          done();
        }
      });
    });
  });

  describe('GET /project/:projectId', function() {
    it('it should get project', function(done) {
      async.waterfall([
        function(callback) {
          // Request to get project
          agent
            .get('/project/'+projectId)
            .then(function(res) {
              res.should.have.status(200);

              // Check the project data whether it is correct
              var project = res.body;
              project.should.be.a('object');
              project.name.should.a('string');
              project.name.should.equal(testProject.name);
              project.profile.should.a('string');
              project.profile.should.equal(testProject.profile);
              project.version.should.a('string');
              project.version.should.equal(testProject.version);
              project.description.should.a('string');
              project.description.should.equal(testProject.description);

              callback(null);
            }, function(error) {
              if (error) {
                callback(error);
              }
            });
        }
      ], function(error) {
        if (error) {
          debug(error);
          done(error);
        } else {
          done();
        }
      });
    });
  });

  describe('DELETE /project/:projectId', function() {
    it('it should delete project', function(done) {
      async.waterfall([
        function(callback) {
          // Request to delete project
          agent
            .delete('/project/'+projectId)
            .then(function(res) {
              res.should.have.status(200);

              // Check the project whether it is deleted correctly
              Project.find({'_id': projectId}, function(error, projects) {
                if (error) {
                  callback(error);
                }

                // Found project should be the array and zero
                projects.should.be.a('array');
                projects.should.have.lengthOf(0);

                callback(null);
              });
            }, function(error) {
              if (error) {
                callback(error);
              }
            });
        }, function(callback) {
          // Check the project folder whether it is deleted correctly
          var projectPath = path.join(process.cwd(), 'projects', projectId);
          if (!fs.existsSync(projectPath)) {
            callback(null);
          } else {
            callback('Project folder is not deleted.');
          }
        }, function(callback) {
          // Check the support folder whether it is deleted correctly
          var supportPath = path.join(process.cwd(), 'projects', 'support', projectId);
          if (!fs.existsSync(supportPath)) {
            callback(null);
          } else {
            callback('Support folder is not deleted.');
          }
        }
      ], function(error) {
        if (error) {
          debug(error);
          done(error);
        } else {
          done();
        }
      });
    });
  });
});
