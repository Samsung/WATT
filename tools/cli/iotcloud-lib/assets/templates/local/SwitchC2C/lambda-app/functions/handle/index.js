const { request } = require('https');
const { parse } = require('url');

const APP_INFO = {
  name: 'Install simple switch c2c device',
  description: 'Install simple switch c2c device',
  id: 'simpleswitch',
  permissions: [
    'i:deviceprofiles',
    'w:devices:*',
  ],
  firstPageId: '1',
};

const CONFIG_PAGE = {
  pageId: '1',
  name: 'Install simple switch c2c device',
  nextPageId: null,
  previousPageId: null,
  complete: true,
  sections: [
    {
      name: 'Install simple switch c2c device',
      settings: [
        {
          description: 'Install simple switch c2c device',
          type: 'PARAGRAPH',
        },
      ],
    },
  ],
};

function createDeviceEvent(baseUrl, deviceId, accessToken, cmd, callback) {
  const options = parse(`${baseUrl}/devices/${deviceId}/events`);
  options.method = 'POST';
  options.headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const body = [{
    component: cmd.componentId,
    capability: cmd.capability,
    attribute: 'switch',
    value: cmd.command,
  }];

  let response = '';
  const req = request(options, (res) => {
    res.on('data', (chunk) => {
      response += chunk;
    });
    res.on('end', () => {
      console.log(`response: ${response}`);
      callback(null, { statusCode: 200 });
    });
  });
  req.on('error', (e) => {
    console.log(`error ${e}`);
    callback(e);
  });
  req.write(JSON.stringify(body));
  req.end();
}

function createDevice(baseUrl, label, locationId, profileId, installedAppId, accessToken,
  callback) {
  const options = parse(`${baseUrl}/devices`);
  options.method = 'POST';
  options.headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const body = {
    label,
    locationId,
    app: {
      profileId,
      installedAppId,
      externalId: label,
    },
  };

  const req = request(options, (res) => {
    let response = '';
    res.on('data', (chunk) => {
      response += chunk;
    });
    res.on('end', () => {
      console.log(`response: ${response}`);
      const resp = JSON.parse(response);
      function getInitialStateOfDevice() {
        // TODO: get device state of target cloud
        return Promise.resolve();
      }
      getInitialStateOfDevice()
      .then(() => {
        const command = {
          capability: 'switch',
          componentId: 'main',
          command: 'on',
          arguments: [],
        };
        createDeviceEvent(baseUrl, resp.deviceId, accessToken, command, callback);
      });
    });
  });
  req.on('error', (e) => {
    console.log(`error ${e}`);
    callback(e);
  });
  req.write(JSON.stringify(body));
  req.end();
}

function handleEvents(event, callback) {
  function sendCommandToTargetCloud() {
    // TODO: map smartthings command to target cloud command
    return Promise.resolve();
  }

  const baseUrl = event.settings.baseUrl;
  const { events, authToken } = event.eventData;
  const dcEvents = events.filter(evt => evt.eventType === 'DEVICE_COMMANDS_EVENT');
  dcEvents.forEach((dcEvent) => {
    const cmds = dcEvent.deviceCommandsEvent.commands;
    const deviceId = dcEvent.deviceCommandsEvent.deviceId;
    cmds.forEach((cmd) => {
      sendCommandToTargetCloud()
      .then(() => createDeviceEvent(baseUrl, deviceId, authToken, cmd, callback));
    });
  });
}

exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  try {
    switch (event.lifecycle) {
      case 'CONFIGURATION': {
        const phase = event.configurationData.phase;
        const result = {};
        if (phase === 'INITIALIZE') result.initialize = APP_INFO;
        else if (phase === 'PAGE') result.page = CONFIG_PAGE;
        else throw new Error(`Unsupported config phase: ${phase}`);
        callback(null, { configurationData: result, statusCode: 200 });
        break;
      }
      case 'INSTALL': {
        const { installedApp, authToken } = event.installData;
        const { settings } = event;
        const { installedAppId, locationId } = installedApp;
        const { profileId, deviceName, baseUrl } = settings;
        createDevice(baseUrl, deviceName, locationId, profileId, installedAppId, authToken,
          callback);
        break;
      }
      case 'UPDATE': {
        callback(null, { statusCode: 200 });
        break;
      }
      case 'UNINSTALL': {
        callback(null, { statusCode: 200 });
        break;
      }
      case 'EVENT': {
        handleEvents(event, callback);
        break;
      }
      case 'PING': {
        callback(null, {
          statusCode: 200,
          pingData: { challenge: event.pingData.challenge },
        });
        break;
      }
      default: {
        callback(`Error, lifecycle is not supported: ${event.lifecycle}`);
      }
    }
  } catch (error) {
    console.log(`Error occurred: ${error}`);
    callback(`Error occurred: ${error}`);
  }
};
