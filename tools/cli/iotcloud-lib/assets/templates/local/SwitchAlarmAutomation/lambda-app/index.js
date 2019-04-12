const https = require('https');

const SWITCH_ID = 'switch';
const ALARM_ID = 'alarm';
const baseUrl = 'apis.smartthingsgdev.com'; // protocol is https

function request(options, body, callback) {
  const opts = options;
  const reqBody = JSON.stringify(body);
  opts.headers['Content-Type'] = 'application/json';
  opts.headers['Content-Length'] = reqBody.length;
  const req = https.request(opts, (response) => {
    response.on('data', (data) => {
      callback(null, {
        statusCode: response.statusCode,
        body: data,
      });
    });
  });
  req.on('error', callback);
  req.write(reqBody);
  req.end();
}

function handleConfiguration(event, context, callback) {
  const config = event.configurationData;
  if (!config) throw new Error('No config in request');

  const result = {};
  const phase = config.phase;
  switch (phase) {
    case 'INITIALIZE':
      result.initialize = {
        name: 'LambdaTestApp',
        description: 'Lambda test app',
        requirements: [{
          id: 'app',
          permissions: [],
        }],
        firstPageId: '1',
      };
      break;
    case 'PAGE':
      console.dir(config.config.app);
      result.page = {
        pageId: '1',
        name: 'Lambda test app',
        nextPageId: null,
        previousPageId: null,
        complete: true,
        sections: [{
          name: 'Switch',
          settings: [{
            id: SWITCH_ID,
            name: 'switch-name',
            description: 'switch device',
            type: 'DEVICE',
            required: true,
            multiple: false,
            capabilities: ['switch'],
            permissions: ['r'],
          }],
        }, {
          name: 'Alarm',
          settings: [{
            id: ALARM_ID,
            name: 'alarm-name',
            description: 'alarm device',
            type: 'DEVICE',
            required: true,
            multiple: false,
            capabilities: ['alarm'],
            permissions: ['r', 'x'],
          }],
        }],
      };
      break;
    default:
      throw new Error(`Unsupported config phase ${phase}`);
  }

  callback(null, {
    configurationData: result,
    statusCode: 200,
  });
}


function subscribeSwitchStatus(installedAppId, config, auth, callback) {
  const path = `/installedapps/${installedAppId}/subscriptions`;
  const deviceConfig = config[SWITCH_ID][0].deviceConfig;
  const reqBody = {
    sourceType: 'DEVICE',
    device: {
      componentId: deviceConfig.componentId,
      deviceId: deviceConfig.deviceId,
      capability: 'switch',
      attribute: 'switch',
      stateChangeOnly: true,
      subscriptionName: 'switchSubscription',
      value: '*',
    },
  };
  request({
    hostname: baseUrl,
    path,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth}` },
  }, reqBody, (err, resp) => {
    if (!err && resp.statusCode === 200) {
      callback(null, {
        statusCode: 200,
        installData: {},
      });
    } else {
      console.log('subscription failed');
      callback(null, {
        statusCode: resp.statusCode,
        installData: { err },
      });
    }
  });
}

function actuateAlarm(deviceId, status, auth, callback) {
  const path = `/devices/${deviceId}/commands`;
  const reqBody = [{
    component: 'main',
    capability: 'alarm',
    command: status,
    arguments: [],
  }];
  console.log('actuate alarm');
  console.log(reqBody);
  request({
    hostname: baseUrl,
    path,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth}` },
  }, reqBody, (err, resp) => {
    if (!err) {
      callback(null, {
        statusCode: resp.statusCode,
        eventData: {},
      });
    } else {
      console.log('command device failed');
      callback(null, {
        statusCode: resp.statusCode,
        eventData: { err },
      });
    }
  });
}

function handleInstall(event, context, callback) {
  const installedApp = event.installData.installedApp;
  const installedAppId = installedApp.installedAppId;
  const config = installedApp.config;
  const auth = event.installData.authCode;

  subscribeSwitchStatus(installedAppId, config, auth, callback);
}

function handleEvent(event, context, callback) {
  const eventData = event.eventData;
  const type = eventData.event.eventType;
  if (type === 'DEVICE_EVENT') {
    const auth = eventData.authToken;
    const config = eventData.installedApp.config;
    const deviceEvent = eventData.event.deviceEvent;
    if (deviceEvent.deviceId === config[SWITCH_ID][0].deviceConfig.deviceId) {
      if (deviceEvent.value === 'on') {
        actuateAlarm(config[ALARM_ID][0].deviceConfig.deviceId, 'siren', auth, callback);
      } else if (deviceEvent.value === 'off') {
        actuateAlarm(config[ALARM_ID][0].deviceConfig.deviceId, 'off', auth, callback);
      }
    }
  } else {
    console.log('Not device event');
    callback(null, {
      statusCode: 200,
      eventData: {},
    });
  }
}

exports.handle = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  console.log(JSON.stringify(context, null, 2));
  try {
    switch (event.lifecycle) {
      case 'CONFIGURATION':
        handleConfiguration(event, context, callback);
        break;
      case 'INSTALL':
        handleInstall(event, context, callback);
        break;
      case 'UPDATE':
        break;
      case 'UNINSTALL':
        break;
      case 'EVENT':
        handleEvent(event, context, callback);
        break;
      case 'PING':
        callback(null, {
          statusCode: 200,
          pingData: { challenge: event.pingData.challenge },
        });
        break;
      default :
        callback(`Error: unknown lifecycle ${event.lifecycle}`);
    }
  } catch (error) {
    callback(`Error: ${error}`);
  }
};
