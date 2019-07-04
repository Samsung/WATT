process.env.NODE_ENV = 'test';

var chai     = require('chai');
var chaiHttp = require('chai-http');
var server   = require('../app.js');

chai.use(chaiHttp);

describe('test demos.js', () => {

  describe('test demos error', () => {
    it('should return 500 error', (done) => {
      chai.request(server)
        .get('/demos')
        .end((error,res) => {
          res.status.should.equal(500);
          done();
        });
    });
  });

  describe('test demos? error', () => {
    it('should return 500 error', (done) => {
      chai.request(server)
        .get('/demos?')
        .end((error,res) => {
          res.status.should.equal(500);
          done();
        });
    });
  });

  describe('test demos?WRONG_PARAM error', () => {
    it('should return 500 error', (done) => {
      chai.request(server)
        .get('/demos?WRONG_PARAM')
        .end((error,res) => {
          res.status.should.equal(500);
          done();
        });
    });
  });

  describe('test demos?path error', () => {
    it('should return 400 error', (done) => {
      chai.request(server)
        .get('/demos?path')
        .end((error,res) => {
          res.status.should.equal(400);
          done();
        });
    });
  });

  describe('test demos?path= error', () => {
    it('should return 400 error', (done) => {
      chai.request(server)
        .get('/demos?path=')
        .end((error,res) => {
          res.status.should.equal(400);
          done();
        });
    });
  });

  describe('test demos?path=NOT_EXISTING error', () => {
    it('should return 400 error', (done) => {
      chai.request(server)
        .get('/demos?path=NOT_EXISTING')
        .end((error,res) => {
          res.status.should.equal(400);
          done();
        });
    });
  });

  describe('test successfull demo download', () => {
    it('should succeed', (done) => {
      chai.request(server)
        .get('/demos?path=1.0%2Fexamples%2Fwearable%2FUIComponents%2Fcontents%2Fcontrols%2Fnumberpicker%2Findex.html')
        .end((error,res) => {
          res.status.should.equal(200);
          done();
        });
    }).timeout(20000);
  });


});
