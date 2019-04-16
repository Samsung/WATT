'use strict';

const config = require('config');
const debug = require('debug')('routes:brackets');
const fs = require('fs');
const http = require('http');
const https = require('https');
const httpMock = require('node-mocks-http');
const path = require('path');
const urlUtil = require('url');

const brackets = require('../libs/brackets-server');
const bracketsDist = path.join(process.cwd(), 'libs', 'brackets-server', 'brackets-dist');
const Project = require('../models/project');
const util = require('../libs/util');
const zipped = { '.js': 'application/javascript', '.css': 'text/css'};

module.exports = function(express, server, wsServer) {
  const router = express.Router();

  router.get('/*', util.isLoggedIn, (req, res, next) => {
    const url = req.url;

    if (url.startsWith('/proxy/')) {
      const reqUrl = decodeURIComponent(url.substr('/proxy/'.length));
      let options = urlUtil.parse(reqUrl);
      const httpClient  = options.protocol === 'http' ? http : https;
      if (config.util.getEnv('NODE_ENV') === 'test') {
        httpClient = httpMock;
      } 

      delete options.protocol;
      options.method = 'GET';

      req.pause();
      const connector = httpClient.request(options, (_res) => {
        _res.pause();
        res.writeHead(_res.statusCode, _res.headers);
        _res.pipe(res);
        _res.resume();
      });
      req.pipe(connector);
      req.resume();
      return;
    }

    const cntType = zipped[path.extname(url)];
    let cntPath = path.join(bracketsDist, url);

    if (cntType) {
      cntPath = cntPath + '.gz';
      if (fs.existsSync(cntPath)) {
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', cntType);
        res.sendFile(cntPath);
      } else {
        debug(cntPath + ' is not found.');
        next();
      }
    } else {
      if (fs.existsSync(cntPath)) {
	console.log("fs.existsSync: " + cntPath);
        res.sendFile(path.join(bracketsDist, url));
      } else {
        // Try to connect index.html if the basename of the url is project Id
	
	console.log("Project.findOne");
        Project.findOne({'_id': path.basename(url) }, (err, project) => {
          if (project) {

            // Save project to notify project updates
            project.save();

            const projectId = path.basename(url);

    	    console.log("Project.findOne projectId: " + projectId);

            const bracketsOpts = {
              httpRoot: '/brackets/' + projectId,
              projectsDir: path.join(process.cwd(), 'projects', projectId),
              supportDir: path.join(process.cwd(), 'projects', 'support', projectId)
            };

            brackets(server, wsServer, bracketsOpts);

            res.sendFile(path.join(bracketsDist, 'index.html'));
          } else {
            
	    console.log("Project.findOne fail"+ cntPath);
            debug(cntPath + ' is not found.');
            next();
          }
        });
      }
    }
  });

  return router;
};
