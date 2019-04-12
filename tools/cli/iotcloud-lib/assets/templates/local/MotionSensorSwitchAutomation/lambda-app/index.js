const request = require('request');

const baseUrl = 'https://apis.smartthingsgdev.com';

function createAppInfo() {
  return {
    name: 'Motion Sensor Switch Lambda App',
    description: 'Motion Sensor Switch Lambda App',
    id: 'app',
    permissions: [],
    firstPageId: '1',
  };
}

/**
 *
 * @param pageId name of page to send to user
 * @param currentConfig the values of the currently set configurations by the user for the settings
 * @returns {{id: string, name: string, next: string, complete: boolean, section: object}}
 */
function createConfigPage(pageId) {
  if (pageId !== '1') {
    throw new Error(`Unsupported page name: ${pageId}`);
  }

  return {
    pageId: '1',
    name: 'Light Follows Me Lambda App',
    nextPageId: null,
    previousPageId: null,
    complete: true,
    sections: [
      {
        name: 'select motion sensor',
        settings: [
          {
            id: 'motion1', // ID of this field
            name: 'Which?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: false,
            capabilities: ['motionSensor'],
            permissions: ['r'],
          },
        ],
      },
      {
        name: 'Select switch',
        settings: [
          {
            id: 'switches', // ID of this field
            name: 'Which?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: true,
            capabilities: ['switch', 'actuator'],
            permissions: ['r', 'x'],
          },
        ],
      },
    ],
  };
}

function subscribeToMotion(installedAppId, locationId, config, authToken) {
  const url = `${baseUrl}/installedapps/${installedAppId}/subscriptions`;

  const body = {
    sourceType: 'DEVICE',
    device: {
      componentId: config.motion1[0].deviceConfig.componentId,
      deviceId: config.motion1[0].deviceConfig.deviceId,
      capability: 'motionSensor',
      attribute: 'motion',
      stateChangeOnly: true,
      value: '*',
    },
  };

  console.log('subscribeToMotion:', JSON.stringify(body, null, 2));

  request.post({
    url,
    json: true,
    body,
    headers: { Authorization: `Bearer ${authToken}` },
  }, (error, response) => {
    if (!error && response.statusCode === 200) {
      console.log('succeeded to create subscription');
    } else {
      console.log('failed to created subscription');
      console.log('error', error);
      console.log('response:', response.toJSON());
    }
  });
}

function actuateLight(deviceId, status, authToken) {
  const url = `${baseUrl}/devices/${deviceId}/commands`;
  const body = {
    commands: [{
      component: 'main',
      capability: 'switch',
      command: status,
      arguments: [],
    }],
  };

  console.log('Actuate switch:', body);

  request.post({
    url,
    headers: { Authorization: `Bearer ${authToken}` },
    body,
    json: true,
  }, (error, response) => {
    if (!error && response.statusCode === 200) {
      console.log('succeeded to auctuation.');
    } else {
      console.log('failed to auctuation.');
      console.log('error', error);
      console.log('response:', response.toJSON());
    }
  });
}

function motionHandler(installedAppId, deviceEvent, config, authToken) {
  if (deviceEvent.deviceId === config.motion1[0].deviceConfig.deviceId) {
    if (deviceEvent.value === 'active') {
      console.log('turning on switch');
      actuateLight(config.switches[0].deviceConfig.deviceId, 'on', authToken);
    } else if (deviceEvent.value === 'inactive') {
      actuateLight(config.switches[0].deviceConfig.deviceId, 'off', authToken);
    }
  }
}
function handleInstall(installedApp, authCode) {
  const { locationId, installedAppId, config } = installedApp;
  subscribeToMotion(installedAppId, locationId, config, authCode);
}

function handleUpdate(installedApp, authToken) {
  const { locationId, installedAppId, config } = installedApp;
  const url = `${baseUrl}/locations/${locationId}/installedapps/${installedAppId}/subscriptions`;

  request.delete({
    url,
    headers: { Authorization: `Bearer ${authToken}` },
  }, () => {
    subscribeToMotion(installedAppId, locationId, config, authToken);
  });
}

function handleEvents(eventData) {
  const eventType = eventData.events[0].eventType;
  if (eventType === 'DEVICE_EVENT') {
    console.log(eventData.events[0].deviceEvent);
    motionHandler(eventData.installedApp.installedAppId, eventData.events[0].deviceEvent,
      eventData.installedApp.config, eventData.authToken);
  }
}

function handleConfig(event) {
  if (!event.config) {
    throw new Error('No config section set in request.');
  }

  const configurationData = {};
  const phase = event.phase;
  const pageId = event.pageId;
  // const settings = event.config;

  switch (phase) {
    case 'INITIALIZE':
      configurationData.initialize = createAppInfo();
      break;
    case 'PAGE':
      configurationData.page = createConfigPage(pageId);
      break;
    default:
      throw new Error(`Unsupported config phase: ${phase}`);
  }

  return configurationData;
}

exports.handler = (event, context, callback) => {
  console.log('event:', JSON.stringify(event, null, 2));
  try {
    let res;

    switch (event.lifecycle) {
      case 'CONFIGURATION': {
        res = handleConfig(event.configurationData);
        callback(null, {
          configurationData: res,
          statusCode: 200,
        });
        break;
      }
      case 'INSTALL': { // This comes from Execution Service
        handleInstall(event.installData.installedApp, event.installData.authToken);
        callback(null, {
          installData: {},
          statusCode: 200,
        });
        break;
      }
      case 'UPDATE': { // This comes from Execution Service
        handleUpdate(event.updateData.installedApp, event.authToken);
        callback(null, {
          updateData: {},
          statusCode: 200,
        });
        break;
      }
      case 'UNINSTALL': { // This comes from Execution Service
        // probably not needed for this app
        break;
      }
      case 'EVENT': { // This comes from Execution Service
        handleEvents(event.eventData);
        callback(null, {
          eventData: {},
          statusCode: 200,
        });
        break;
      }
      case 'PING': { // This comes from Execution Service
        callback(null, {
          statusCode: 200,
          pingData: {
            challenge: event.pingData.challenge,
          },
        });
        break;
      }
      default: {
        callback(`Error, event.lifecycle is not supported: ${event.lifecycle}`);
      }
    }
  } catch (error) {
    callback(`Error occurred: + ${error}`);
  }
};
