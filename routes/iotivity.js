const debug = require('debug')('routes:iotivity');
const validate = require('isvalid').validate;
const homedir = require('os').homedir();
const { exec } = require('child_process');

const Project = require('../models/project');
const devicePluginManager = require('../libs/device-plugin-manager');

require('iotivity.js');

const sendInvalidParams = res => res.status(400).send('Invalid params');

const runSt = args =>
  new Promise((resolve, reject) => {
    try {
      exec(`node ${process.cwd()}/tools/cli/st ${args}`, err =>
        err ? reject(err) : resolve());
    } catch (err) {
      reject(err);
    }
  });

let ocfDevices = [];
let registered = false;

const stringTypeReq = { type: String, required: true };

module.exports = function (express) {
  const router = express.Router();

  router.post('/createSmartThingsVirtualDevice/:projectId',
    validate.body({
      'filePath': stringTypeReq,
      'deviceName': stringTypeReq,
      'capabilities': {
        type: Array,
        len: '-1',
        schema: stringTypeReq
      }
    }),
    (req, res) => {
      const projectId = req.params.projectId;
      const user = req.user;
      Project.findById(projectId, (err, project) => {
        if (err) {
          debug(err);
          return res.status(400).send({ error: err });
        }
        if (project.user.toString() !== user._id.toString()) {
          return res.status(400).send({ error: 'Not user project' });
        }
        devicePluginManager.createDevice(projectId, req.body.filePath, req.body.deviceName, req.body.capabilities)
          .then(deviceData => res.status(200).json(deviceData))
          .catch(err => res.status(500).send({ error: err.message }));
      });
    });

  router.post('/registerCloudLoginInfo',
    validate.body({
      'uid': stringTypeReq,
      'authprovider': stringTypeReq,
      'devicetype': stringTypeReq,
      'accesstoken': stringTypeReq,
      'deviceId': stringTypeReq
    }),
    function (req, res) {
      res.json(iotivity.registerCloudLoginInfo(
        req.body.uid,
        req.body.authprovider,
        req.body.devicetype,
        req.body.accesstoken,
        req.body.deviceId));
    });

  router.get('/getOCFDevices',
    function (req, res) {
      const promise = !registered
        ? runSt('refresh-token')
          .catch(() => runSt('request-token --show-ui'))
          .catch(err => {
            console.log(err);
            throw { code: 500 };
          })
          .then(() => {
            const security = require(`${homedir}/.iotcloud/cli/security.json`);
            const config = require(`${homedir}/.iotcloud/cli/config.json`);
            if (!security || !security.userId || !security.accessToken || !config || !config.deviceId) {
              throw { code: 500 };
            }
            if (!iotivity.registerCloudLoginInfo(security.userId, 'samsung-us', 'samsungconnect', security.accessToken, config.deviceId)) {
              throw { code: 400 };
            }
            registered = true;
          })
        : Promise.resolve();
      promise.then(() => iotivity.getOCFDevices(r => {
        ocfDevices = r;
        res.json(r);
      })).catch(err => {
        switch (err.code) {
        case 500:
          res.status(err.code).send('Authentication not available');
          break;
        case 400:
          res.status(400).end();
          break;
        default:
          console.log(err);
        }
      });
    });

  router.post('/subscribe',
    validate.body({
      'deviceHandle': stringTypeReq,
    }),
    function (req, res) {
      const ocfDevice = ocfDevices.find(d => d.deviceHandle === req.body.deviceHandle);
      if (!ocfDevice) { return sendInvalidParams(res); }
      if (!ocfDevice.subscribeRes) {
        res.set('Content-Type', 'application/octet-stream');
        ocfDevice.subscribeRes = res;
        ocfDevice.subscribe((result, deviceHandle, uri, updatedValues) => {
          const resData = {
            result,
            deviceHandle,
            uri,
            updatedValues
          };
          const buff = Buffer.concat([Buffer.from(JSON.stringify(resData)), Buffer.alloc(1)]);
          if (ocfDevice.subscribeRes) {
            ocfDevice.subscribeRes.write(buff);
          }
        });
      } else {
        res.status(200).end();
      }
    });

  router.post('/unsubscribe',
    validate.body({
      'deviceHandle': stringTypeReq,
    }),
    function (req, res) {
      const ocfDevice = ocfDevices.find(d => d.deviceHandle === req.body.deviceHandle);
      if (!ocfDevice) { return sendInvalidParams(res); }
      ocfDevice.unsubscribe();
      ocfDevice.subscribeRes.end();
      ocfDevice.subscribeRes = null;
      res.status(200).end();
    });

  router.post('/getRemoteRepresentation',
    validate.body({
      'deviceHandle': stringTypeReq,
      'uri': stringTypeReq
    }),
    function (req, res) {
      const ocfDevice = ocfDevices.find(d => d.deviceHandle === req.body.deviceHandle);
      if (!ocfDevice) { return sendInvalidParams(res); }
      ocfDevice.getRemoteRepresentation(req.body.uri, (result, deviceHandle, uri, values) => {
        res.json({
          result,
          deviceHandle,
          uri,
          values
        });
      });
    });

  router.post('/setRemoteRepresentation',
    validate.body({
      'deviceHandle': stringTypeReq,
      'uri': stringTypeReq,
      'jsonObject': {
        type: Object,
        required: true,
        unknownKeys: 'allow',
        schema: {}
      }
    }),
    function (req, res) {
      const ocfDevice = ocfDevices.find(d => d.deviceHandle === req.body.deviceHandle);
      if (!ocfDevice) { return sendInvalidParams(res); }
      ocfDevice.setRemoteRepresentation(req.body.uri, req.body.jsonObject, (result, deviceHandle, uri, values) => {
        res.json({
          result,
          deviceHandle,
          uri,
          values
        });
      });
    });

  router.post('/startMonitoringConnectionState',
    validate.body({
      'deviceHandle': stringTypeReq,
    }),
    function (req, res) {
      const ocfDevice = ocfDevices.find(d => d.deviceHandle === req.body.deviceHandle);
      if (!ocfDevice) { return sendInvalidParams(res); }
      // ocfDevice.startMonitoringConnectionStateRes will be invalidated in
      // stopMonitoringConnectionState API.
      if (!ocfDevice.startMonitoringConnectionStateRes) {
        res.set('Content-Type', 'application/octet-stream');
        ocfDevice.startMonitoringConnectionStateRes = res;
        ocfDevice.startMonitoringConnectionState((result, deviceHandle, state) => {
          const resData = {
            result,
            deviceHandle,
            state,
          };
          const buff = Buffer.concat([Buffer.from(JSON.stringify(resData)), Buffer.alloc(1)]);
          if (ocfDevice.startMonitoringConnectionStateRes) {
            ocfDevice.startMonitoringConnectionStateRes.write(buff);
          }
        });
      } else {
        res.status(200).end();
      }
    });

  router.get('/ping',
    function (req, res) {
      res.json('ok');
    });

  return router;
};
