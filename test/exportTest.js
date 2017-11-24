process.env.NODE_ENV = 'test';

var chai     = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var Project  = require('../models/project');
var server   = require('../app.js');
var should   = chai.should();

chai.use(chaiHttp);

describe('test export', () => {
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

  before((done) => {
    agent.post('/login')
      .send({email: 'test@samsung.com', password: 'test'})
      .end((loginError, loginResult) => {
        loginResult.should.have.status(200);
        agent
          .put('/project')
          .send(testProject)
          .then(function(res) {
            res.should.have.status(200);
            // Save returned project ID
            res.text.should.be.a('string');
            projectId = res.text;
            done();
          });
      });
  });

  describe('POST /export/web', () => {
    it('should test /export/web', (done) => {
      agent.post('/export/web')
        .send({projectId: projectId})
        .end(function(error, res) {
          res.status.should.equal(200); 
          done();
        });
    });
  });

  describe('POST error /export/web', () => {
    it('should test error /export/web', (done) => {
      agent.post('/export/web')
        .send({projectId: 1})
        .end(function(error, res) {
          res.status.should.equal(400);
          done();
        });
    });
  });

  describe('POST /export/share', () => {
    it('should test /export/share', (done) => {
      agent.post('/export/share')
        .send({projectId: projectId, projectName: testProject.name})
        .end(function(error, res) {
          res.status.should.equal(200); 
          done();
        });
    });
  });

  describe('POST error /export/share', () => {
    it('should test error /export/share', (done) => {
      agent.post('/export/share')
        .send({projectId: 1, projectName: 1})
        .end(function(error, res) {
          res.status.should.equal(400);
          done();
        });
    });
  });

  describe('GET /export/tizen', () => {
    it('should test error on /export/tizen', (done) => {
      agent.get('/export/tizen/'+projectId)
        .end(function(error, res) {
          res.status.should.equal(400);
          done();
        });
    });
  });
});
