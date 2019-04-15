'use strict';

const request = require('request');

const baseUrl = 'https://apis.smartthingsgdev.com';

exports.handler = (event, context, callback) => {
    console.log('Event type is:', event.lifecycle);
    console.log(event);
    try {
        let res;

        switch(event.lifecycle) {
            case 'CONFIGURATION': {
                res = handleConfig(event.configurationData);
                callback(null, {
                    configurationData: res,
                    statusCode: 200
                });
                break;
            }
            case 'INSTALL': { // This comes from Execution Service
                handleInstall(event.installData.installedApp, event.installData.authToken);
                callback(null, {
                    installData: {},
                    statusCode: 200
                });
                break;
            }
            case 'UPDATE': { // This comes from Execution Service
                handleUpdate(event.updateData.installedApp, event.authToken);
                callback(null, {
                    updateData: {},
                    statusCode: 200
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
                    statusCode: 200
                });
                break;
            }
            case 'PING': { // This comes from Execution Service
                callback(null, {
                    statusCode: 200,
                    pingData: {
                        challenge: event.pingData.challenge
                    }
                });
                break;
            }
            default: {
                callback('Error, execType is not supported: ${event.executionType}');
            }
        }
    } catch (error) {
        callback('Error occurred: ' + error);
    }
};

function handleInstall(installedApp, authCode) {
    // call subscription service to subscribe to events for selected motion sensor - event.InstallRequest.config.motion1[0]
    // with event.authToken

    subscribeToMotion(installedApp.installedAppId, installedApp.locationId, installedApp.config, authCode);
}

function subscribeToMotion(installedAppId, locationId, config, authToken) {
    const path = '/installedapps/' + installedAppId + '/subscriptions'

    let subRequest = {
        sourceType: 'DEVICE',
        device: {
            componentId: config.motion1[0].deviceConfig.componentId,
            deviceId: config.motion1[0].deviceConfig.deviceId,
            capability: 'motionSensor',
            attribute: 'motion',
            stateChangeOnly: true,
            value: '*'
        }
    };

    console.log('subscribeToMotion:', [installedAppId, config, authToken, path]);

    request.post({
        url: baseUrl + path,
        json: true,
        body: subRequest,
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    },function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('this worked')
        } else {
            console.log('failed to created subscriptions');
            console.log(error);
        }
    });
}

function handleUpdate(installedApp, authToken) {
    // call subscription to unsubscribe for all devices with event.authToken
    // call handleInstall to resubscribe to device events for motion sensor

    const path = '/locations/${installedApp.locationId}/installedapps/${installedApp.installedAppId}/subscriptions';

    request.delete({
        url: baseUrl + path,
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    }, function () {
        subscribeToMotion(installedApp.installedAppId, installedApp.config, authToken);
    });
}

function handleEvents(eventData) {
    const eventType = eventData.events[0].eventType;
    if ('DEVICE_EVENT' === eventType) {
        console.log(eventData.events[0].deviceEvent);
        motionHandler(eventData.installedApp.installedAppId, eventData.events[0].deviceEvent, eventData.installedApp.config, eventData.authToken);
    } else if ('TIMER_EVENT' === eventType) {
        timerHandler(eventData.installedApp.installedAppId, eventData.installedApp.config, eventData.authToken)
    }
}

function handleConfig(event) {
    if (!event.config) {
        throw new Error('No config section set in request.');
    }

    const configurationData = {};
    const phase = event.phase;
    const pageId = event.pageId;
    const settings = event.config;

    switch (phase) {
        case 'INITIALIZE':
            configurationData.initialize = createAppInfo();
            break;
        case 'PAGE':
            configurationData.page = createConfigPage(pageId, settings);
            break;
        default:
            throw new Error('Unsupported config phase: ${phase}');
            break;
    }

    return configurationData;
}

function createAppInfo() {
    return {
        name: 'Light Follows Me Lambda App',
        description: 'Light Follows Me Lambda App',
        id: 'app',
        permissions: [],
        firstPageId: '1'
    }
}

/**
 *
 * @param pageId name of page to send to user
 * @param currentConfig the values of the currently set configurations by the user for the settings
 * @returns {{id: string, name: string, next: string, complete: boolean, section: object}}
 */
function createConfigPage(pageId, currentConfig) {
    if (pageId !== '1') {
        throw new Error('Unsupported page name: ${pageId}');
    }

    return {
        pageId: '1',
        name: 'Light Follows Me Lambda App',
        nextPageId: null,
        previousPageId: null,
        complete: true,
        sections: [
            {
                name: 'Turn on when there\'s movement...',
                settings: [
                    {
                        id: 'motion1', // ID of this field
                        name: 'Where?',
                        description: 'Tap to set',
                        type: 'DEVICE',
                        required: true,
                        multiple: false,
                        capabilities: ['motionSensor'],
                        permissions: ['r']
                    }
                ]
            },
            {
                name: 'And off when there\'s been no movement for...',
                settings: [
                    {
                        id: 'minutes1', // ID of this field
                        name: 'Minutes?',
                        description: 'Tap to set',
                        type: 'NUMBER',
                        required: true
                    }
                ]
            },
            {
                name: 'Turn on/off light(s)...',
                settings: [
                    {
                        id: 'switches', // ID of this field
                        name: 'Which?',
                        description: 'Tap to set',
                        type: 'DEVICE',
                        required: true,
                        multiple: true,
                        capabilities: ['switch', 'actuator'],
                        permissions: ['r', 'x']
                    }
                ]
            }
        ]
    };
}

function motionHandler(installedAppId, deviceEvent, config, authToken) {
    if (deviceEvent.deviceId === config.motion1[0].deviceConfig.deviceId) {
        if (deviceEvent.value === 'active') {
            console.log('turning on lights');
            // API call to turn on switches
            actuateLight(config.switches[0].deviceConfig.deviceId, 'on', authToken);
        } else if (deviceEvent.value === 'inactive') {
            actuateLight(config.switches[0].deviceConfig.deviceId, 'off', authToken);
        }
    }
}

function timerHandler(installedAppId, config, authToken) {

    getDeviceState(config.motion1[0].deviceConfig.deviceId, authToken, function(body) {
        var info = JSON.parse(body);

        console.log(info);

        if(info.main.switch.value === "off") {
            actuateLight(config.switches[0].deviceConfig.deviceId, 'off', authToken);
        }
    });
}

function actuateLight(deviceId, status, authToken) {
    const path = '/devices/' + deviceId + '/commands';
    const deviceRequest = {
        component: 'main',
        capability: 'switch',
        command: status,
        arguments: []
    };

    console.log('Actuate Light:', [path, deviceRequest]);

    request.post({
        url: baseUrl + path,
        json: true,
        body: [deviceRequest],
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('this worked')
        }
    });
}

function getDeviceState(deviceId, authToken, callback) {
    const path = '/devices/' + deviceId + '/states';

    console.log('Get Device State:', [deviceId]);

    request.get({
        url: baseUrl + path,
        json: true,
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                callback(body)
            }
        }
    });
}