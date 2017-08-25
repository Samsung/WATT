process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var should = chai.should();

var server = require('../app.js');
var User = require('../models/user');

chai.use(chaiHttp);

describe('index route', () => {

  before((done) => {
    User.remove({}, (err) => {
      done();
    });
  });

  describe('/GET index', () => {
    it('it should GET index', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/GET signup', () => {
    it('it should GET signup', (done) => {
      chai.request(server)
        .get('/signup')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/POST signup', () => {
    it('it should POST signup', (done) => {
      chai.request(server)
        .post('/signup')
        .send({email: 'test@samsung.com', password: 'test'})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/GET login', () => {
    it('it should GET login', (done) => {
      chai.request(server)
        .get('/login')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/POST login', () => {
    it('it should POST login', (done) => {
      chai.request(server)
        .post('/login')
        .send({email: 'test@samsung.com', password: 'test'})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/GET logout', () => {
    it('it should GET logout', (done) => {
      chai.request(server)
        .get('/logout')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/GET logout after login', () => {
    var agent = chai.request.agent(server);

    it('it should GET logout after login', (done) => {
      agent.post('/login')
        .send({email: 'test@samsung.com', password: 'test'})
        .end((loginError, loginResult) => {
          loginResult.should.have.status(200);
          agent.get('/logout')
            .end((logoutError, logoutResult) => {
              logoutResult.should.have.status(200);
              done();
            });
        });
    });
  });

});
