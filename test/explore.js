process.env.NODE_ENV = 'test';

var debug = require('debug')('test');
var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');
var path = require('path');
var should = chai.should();

var Project = require('../models/project');
var server = require('../app.js');

chai.use(chaiHttp);

describe('routes/explore.js Unit Test', function() {
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
        return done(error);
      }

      // Login before starting test
      agent.post('/login')
        .send({email: 'test@samsung.com', password: 'test'})
        .end(function(loginError, res) {
          if (loginError) {
            return done(loginError);
          }

          // Put project for testing
          agent
            .put('/project')
            .send(testProject)
            .then(function(res) {
              res.should.have.status(200);
              projectId = res.text;
              done();
            }, function(error) {
              if (error) {
                return done(error);
              }
            });
        });
    });
  });

  describe('GET /explore/:projectId', function() {
    it('it should redirect to brackets page', function(done) {
      agent
        .get('/explore/'+projectId)
        .then(function(res) {
          res.should.have.status(200);

          should.exist(res.redirects);

          const redirects = res.redirects;
          redirects.should.be.an('array');
          redirects.should.lengthOf(1);

          // Check url whether it is redirected correctly
          const redirect = redirects[0];
          redirect.should.be.a('string');
          redirect.endsWith('/brackets/'+projectId).should.equal(true);

          done();
        }, function(error) {
          if (error) {
            done(error);
          }
        });
    });
  });

  after(function(done) {
    // Remove added project after test
    agent
      .delete('/project/'+projectId)
      .then(function(res) {
        res.should.have.status(200);
        done();
      }, function(error) {
        if (error) {
          done(error);
        }
      });
  });
});