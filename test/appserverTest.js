process.env.NODE_ENV = 'test';

var chai     = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var server   = require('../app.js');
var should   = chai.should();

chai.use(chaiHttp);

describe('test app.js', () => {

  describe('test 404 error', () => {
    it('should return 404 error', (done) => {
      chai.request(server)
        .get('/wattwattwatt')
        .end((error,res) => {
          res.status.should.equal(404);
          done();
        });
    });
  });

  describe('test port success : normal case', () => {
    it('should test normal port', (done) => {
      var value = 3002;
      var result = server.normalizePort(value);
      result.should.equal(value);
      done();
    });
  });

  describe('test port error : negative case', () => {
    it('should test negative port', (done) => {
      var value = -1;
      var result = server.normalizePort(value);
      result.should.equal(false);
      done();
    });
  });

  describe('test port error : NaN case', () => {
    it('should test NaN port', (done) => {
      var value = 'test';
      var result = server.normalizePort(value);
      result.should.equal(value);
      done();
    });
  });

  describe('test calling of onListening', () => {
    it('test onListening', (done) => {
      server.emit('listening');
      done();
    });
  });

  describe('test onError check default', () => {
    it('test onError default', (done) => {
      try {
        var fakeError = new Error('test');
        fakeError.syscall = 'listen';
        fakeError.code = 42;
        server.emit('error', fakeError);
      } catch (error) {
        done();
      }
    });
  });

  describe('test onError check syscall', () => {
    it('test onError syscall', (done) => {
      try {
        var fakeError = new Error('test');
        fakeError.syscall = 'test';
        server.emit('error', fakeError);
      } catch (error) {
        done();
      }
    });
  });

  describe('test onError EACCES', () => {
    it('test onError EACCES', (done) => {
      try {
        var fakeError = new Error('test');
        fakeError.syscall = 'listen';
        fakeError.code = 'EACCES';
        server.emit('error', fakeError);
      } catch (error) {
        done();
      }
    });
  });

  describe('test onError EADDRINUSE', () => {
    it('test onError EADDRINUSE', (done) => {
      try {
        var fakeError = new Error('test');
        fakeError.syscall = 'listen';
        fakeError.code = 'EADDRINUSE';
        server.emit('error', fakeError);
      } catch (error) {
        done();
      }
    });
  });

});
