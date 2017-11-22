process.env.NODE_ENV = 'test';

const chai     = require('chai');
const chaiHttp = require('chai-http');
const fs       = require('fs');
const fse      = require('fs-extra');
const mongoose = require('mongoose');
const path     = require('path');
const Project  = require('../models/project');
const server   = require('../app.js');
const should   = chai.should();

chai.use(chaiHttp);

describe('test import', () => {
  const agent = chai.request.agent(server);
  let projectId;

  before(done => {
    // Remove all projects before starting test
    Project.remove({}, error => {
      if (error) {
        return done(error);
      }

      // Login before starting test
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

  describe('PUT /import/archive', () => {
    it('should test /import/archive', done => {
      agent.put('/import/archive')
        .send({
          name: 'test',
          description: 'test project'
        }).end((error, res) => {
          if (error) {
            return done(error);
          }

          res.should.have.status(200);

          res.text.should.be.a('string');
          projectId = res.text;

          done();
        });
    });
  });

  describe('POST /import/archive/upload', () => {
    it('should test /import/archive/upload', done => {
      const zipFile = path.join(process.cwd(), 'test', 'resource', 'HelloWorld.zip');
      agent.post('/import/archive/upload/'+projectId)
        .attach('uploads[]', fs.readFileSync(zipFile), 'HelloWorld.zip')
        .end((error, res) => {
          if (error) {
            return done(error);
          }

          res.should.have.status(200);

          done();
        });
    });
  });

  after(done => {
    // Remove created project
    if (projectId) {
      Project.findOneAndRemove(projectId, error => {
        if (error) {
          return done(error);
        }

        const projectPath = path.join(process.cwd(), 'projects', projectId);
        fse.ensureDir(projectPath, ensureError => {
          if (ensureError) {
            return done(ensureError);
          }

          fse.remove(projectPath, removeError => {
            if (removeError) {
              return done(removeError);
            }

            done();
          });
        });
      });
    }
  });
});