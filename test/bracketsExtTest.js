process.env.NODE_ENV = 'test';

var chai     = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var Project  = require('../models/project');
var server   = require('../app.js');
var should   = chai.should();

chai.use(chaiHttp);

describe('test /brackets-ext', () => {
  var agent = chai.request.agent(server);

  before((done) => {
    agent.post('/login')
      .send({email: 'test@samsung.com', password: 'test'})
      .end((loginError, loginResult) => {
        loginResult.should.have.status(200);
        done();
      });
  });

  describe('GET /brackets-ext/api', () => {
    it('should test /brackets-ext/api', (done) => {
      agent
        .get('/brackets-ext/api')
        .end((error,res) => {
          res.status.should.equal(200);
          done();
        });
    });
  });

  after((done) => {
    agent
      .get('/logout')
      .end((logoutError, logoutResult) => {
        logoutResult.should.have.status(200);
        done();
      });
  });
});
