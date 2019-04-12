const WebSockServer = require('websocket').server;
const DataBaseServer = require('./DataBaseHandler');

function SHubPub() {
  this.wsServer = null;
}

SHubPub.prototype.createWsServer = function(server) {
  try {
    this.wsServer = new WebSockServer({
      httpServer: server,
      autoAcceptConnections: false
    });
    return this;
  } catch (error) {
    console.error(`WebSockServer Initialization Error: ${error}`);
  }
};


SHubPub.prototype.startServer = function(options) {
  if (!options.Type || !options.Url) {
    console.error('Please insert database type & url');
    return;
  } else if (options.Type !== 'MongoDB') {
    console.error(`${options.Type} DataBase is not supported`);
    return;
  }
  try {
    const dataBase = new DataBaseServer(options.Type, options.Url);
    const self = this;
    self.wsServer.on('request', function(request) {
      const connection = request.accept('sync-protocol', request.origin);
      connection.on('message', function(clientMessage) {
        if (clientMessage.type === 'utf8') {
          const dataParams = JSON.parse(clientMessage.utf8Data);

          dataBase.handleParams(dataParams, function(severMessage) {
            // if message from client is Sync,
            // send data to the client as response.
            if (dataParams.Action === 'Sync') {
              connection.sendUTF(severMessage);
            } else {
              // send lastUpdate Time.
              self.wsServer.broadcast(severMessage);
              // send the message to all other clients.
              self.wsServer.connections.forEach(function(connectionsList) {
                if (connection !== connectionsList) {
                  connectionsList.sendUTF(clientMessage.utf8Data);
                }
              });
            }
          });
        } else if (clientMessage.type === 'binary') {
          // TODO: handling binary data with BSON
        } else {
          console.log('Wrong type of ClientMessage');
          return;
        }
      });

      connection.on('close', function(reasonCode, descirption) {
        console.error(connection.remoteAddress + ' disconnected');
      });
    });
  } catch (error) {
    console.error(`DataBaseServer Initialization Error: ${error}`);
  }
};

module.exports = SHubPub;
