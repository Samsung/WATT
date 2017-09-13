process.env.NODE_ENV = 'test';

var chai     = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var Project  = require('../models/project');
var server   = require('../app.js');
var should   = chai.should();

chai.use(chaiHttp);

describe('test /routes/brackets.js', () => {
  var projectId = 0;
  var agent = chai.request.agent(server);

  before((done) => {
    // Remove all projects before starting test
    Project.remove({}, (error) => {
      if (error) {
        return done(error);
      }
      agent
        .post('/signup')
        .send({email: 'test@samsung.com', password: 'test'})
        .end((err, res) => {
          res.should.have.status(200);
          agent.post('/login')
            .send({email: 'test@samsung.com', password: 'test'})
            .end((loginError, res) => {
              if (loginError) {
                return done(loginError);
              }
              done();
            });
        });
    });
  });

  describe('GET /brackets', () => {
    it('should test /brackets', (done) => {
      agent
        .get('/brackets')
        .end((error,res) => {
          res.status.should.equal(200);
          done();
        });
    });
  });

  describe('test /proxy', () => {
    it('should test /proxy', (done) => {
      agent
        .get('/brackets/proxy/')
        .end((error,res) => {
          res.status.should.equal(500); // result from mock
          done();
        });
    });
  });

  describe('GET .js error', () => {
    it('should test error for .js', (done) => {
      agent
        .get('/brackets/test.js')
        .end((error,res) => {
          res.status.should.equal(404);
          done();
        });
    });
  });

  describe('GET projectid error', () => {
    it('should test error for projectid', (done) => {
      agent
        .get('/brackets/1111111')
        .end((error,res) => {
          res.status.should.equal(404);
          done();
        });
    });
  });

  describe('GET projectid normal', () => {
    var testProject = {
      name: 'test',
      format: 'sample',
      type: 'web',
      templateName: 'HelloWorld',
      profile: 'mobile',
      version: '4.0',
      description: 'test project'
    };

    it('should test get projectid', (done) => {
      agent
        .put('/project')
        .send(testProject)
        .then((res) => {
          res.should.have.status(200);
          res.text.should.be.a('string');
          projectId = res.text;
          agent
            .get('/brackets/'+projectId)
            .end((error,res) => {
              res.status.should.equal(200);
              done();
            });
        });
    });
  });

  after((done) => {
    if(projectId !== 0) {
      agent
        .delete('/project/'+projectId)
        .then((res) => {
          res.should.have.status(200);
        });
    }
    agent
      .get('/logout')
      .end((logoutError, logoutResult) => {
        logoutResult.should.have.status(200);
        done();
      });
  });
});
