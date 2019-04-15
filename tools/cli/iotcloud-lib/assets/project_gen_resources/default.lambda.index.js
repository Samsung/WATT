
function handleConfiguration(event, context, callback) {
  // NOTE: default example
  const config = event.configurationData;
  if (!config) throw new Error('No config in request');

  const result = {};
  const phase = config.phase;
  switch (phase) {
    case 'INITIALIZE':
      result.initialize = {
        name: 'LambdaTestApp',
        description: 'Lambda Test App',
        requirements: [{
          id: 'app',
          permissions: [],
        }],
        firstPageId: '1',
      };
      break;
    case 'PAGE':
      result.page = {
        pageId: '1',
        name: 'Lambda Test App',
        nextPageId: null,
        previousPageId: null,
        complete: true,
        sections: [{
          name: 'Switch',
          settings: [{
            id: 'switch',
            name: 'switch-name',
            description: 'switch device',
            type: 'DEVICE',
            required: true,
            multiple: false,
            capabilities: ['switch'],
            permissions: ['r'],
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

exports.handle = (event, context, callback) => {
  console.log('event:', JSON.stringify(event, null, 2));

  // NOTE: default example
  try {
    switch (event.lifecycle) {
      case 'CONFIGURATION':
        handleConfiguration(event, context, callback);
        break;
      case 'INSTALL':
        callback(null, { statusCode: 200, installData: {} });
        break;
      case 'UPDATE':
        break;
      case 'UNINSTALL':
        break;
      case 'EVENT':
        callback(null, { statusCode: 200, eventData: {} });
        break;
      case 'PING':
        callback(null, { statusCode: 200, pingData: { challenge: event.pingData.challenge } });
        break;
      default :
        callback(`Error: unknown lifecycle ${event.lifecycle}`);
    }
  } catch (error) {
    callback(`Error: ${error}`);
  }
};
