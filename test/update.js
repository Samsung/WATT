process.env.NODE_ENV = 'test';

const chai     = require('chai');
const chaiHttp = require('chai-http');
const server   = require('../app.js');
const should   = chai.should();

chai.use(chaiHttp);

describe('routes/update.js Unit Test', () => {
  const agent = chai.request.agent(server);

  before(done => {
    // Login before starting test
    agent.post('/login')
      .send({email: 'test@samsung.com', password: 'test'})
      .end((error, res) => {
        if (error) {
          return done(error);
        }

        done();
      });
  });

  describe('GET /update', () => {
    it('should test /update', done => {
      agent.get('/update')
        .end((error, res) => {
          if (error) {
            return done(error);
          }

          res.should.have.status(200);

          done();
        });
    });
  });

  describe('POST /update/template', () => {
    it('should test /update/template', done => {
      agent.post('/update/template')
        .send({
          format: 'sample',
          type: 'web'
        }).end((error, res) => {
          if (error) {
            return done(error);
          }

          res.should.have.status(200);

          done();
        });
    });
  });
});