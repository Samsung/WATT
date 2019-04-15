'use strict';
if (!('indexedDB' in window)) {
  window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB ||
                   window.msIndexedDB || window.shimIndexedDB;
}

function SHubSub() {
  this.connection = null;
  this.lastSyncTime = 0;
  this._ID_LST = 0; // definition of _id's value in SyncDataBase.
}

SHubSub.prototype.connect = function(url, callback) {
  const self = this;

  if (self.connection === null) {
    if (url.startsWith('http://')) {
      self.connection = new WebSocket('ws://' + url.split('http://')[1], 'sync-protocol');
    } else if (url.startsWith('https://')) {
      self.connection = new WebSocket('wss://' + url.split('https://')[1], 'sync-protocol');
    } else if (url.startsWith('ws://') || url.startsWith('wss://')) {
      self.connection = new WebSocket(url, 'sync-protocol');
    } else {
      self.connection = new WebSocket('ws://' + url, 'sync-protocol');
    }
  }

  self.connection.onopen = function() {
    const openSyncDB = indexedDB.open('SyncDataBase', 1);

    openSyncDB.onupgradeneeded = function() {
      const db = openSyncDB.result;
      const syncDataStore = db.createObjectStore('SyncDataObject',
        {keyPath: '_id'});
    };

    openSyncDB.onsuccess = function() {
      self.readDBOne('SyncDataBase',
        'SyncDataObject',
        self._ID_LST,
        function(err, result) {
          if (err) {
            self.lastSyncTime = 0;
          } else {
            self.lastSyncTime = result.LastSync;
          }
          const message = {
            Action: 'Sync',
            SyncInfo: 'Start',
            LastSync: self.lastSyncTime,
          };
          sendServer(message, self);
        });
    };

    callback(null, getResponse('ConnectionDone',
      'Websocket connection to '+ url + ' was done',
      null));
  };

  self.connection.onclose = function(event) {
    let reason;
    switch (event.code) {
    case 1000: {
      reason = 'Normal closure, meaning that the purpose for which the' +
               ' connection was established has been fulfilled.';
      break;
    }
    case 1001: {
      reason = 'An endpoint is "going away", such as a server going down or' +
               ' a browser having navigated away from a page.';
      break;
    }
    case 1002: {
      reason = 'An endpoint is terminating the connection due to a protocol' +
               ' error';
      break;
    }
    case 1003: {
      reason = 'An endpoint is terminating the connection because it has' +
               ' received a type of data it cannot accept (e.g., an endpoint' +
               ' that understands only text data MAY send this if it' +
               ' receives a binary message).';
      break;
    }
    case 1004: {
      reason = 'Reserved. The specific meaning might be defined in the future';
      break;
    }
    case 1005: {
      reason = 'No status code was actually present.';
      break;
    }
    case 1006: {
      reason = 'The connection was closed abnormally, e.g., without sending' +
               ' or receiving a Close control frame';
      break;
    }
    case 1007: {
      reason = 'An endpoint is terminating the connection because it has' +
               ' received data within a message that was not consistent with' +
               ' the type of the message (e.g., non-UTF-8 [http://tools.ietf' +
               '.org/html/rfc3629] data within a text message).';
      break;
    }
    case 1008: {
      reason = 'An endpoint is terminating the connection because it has' +
               ' received a message that "violates its policy". This reason' +
               ' is given either if there is no other sutible reason, or if' +
               ' there is a need to hide specific details about the policy.';
      break;
    }
    case 1009: {
      reason = 'An endpoint is terminating the connection because it has' +
               ' received a message that is too big for it to process.';
      break;
    }
    case 1010: {
      reason = 'An endpoint (client) is terminating the connection because' +
               ' it has expected the server to negotiate one or more' +
               ' extension, but the server didn\'t return them in the' +
               ' response message of the WebSocket handshake. <br />' +
               ' Specifically, the extensions that are needed are: ' +
               event.reason;
      break;
    }
    case 1011: {
      reason = 'A server is terminating the connection because it' +
               ' encountered an unexpected condition that prevented it' +
               ' from fulfilling the request.';
      break;
    }
    case 1015: {
      reason = 'The connection was closed due to a failure to perform a' +
               ' TLS handshake (e.g., the server certificate can\'t be' +
               ' verified).';
      break;
    }
    default: reason = 'Unknown reason';
    }

    event.reason = reason;
    callback(getResponse('ConnectClosed',
      'Websocket connection to '+ url + ' was closed',
      event), null);
  };

  self.connection.onerror = function(error) {
    callback(getResponse('ConnectionError',
      'Error happened while connection established',
      error), null);
  };

  self.connection.onmessage = function(event) {
    messageClient(event.data, self, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  };
};

SHubSub.prototype.createDB = function(dbName, dbSubfieldName, KeyPath, callback) {
  const open = indexedDB.open(dbName, 1);
  const self = this;

  open.onupgradeneeded = function() {
    console.log('upgrade needed');
    const db = open.result;
    const store = db.createObjectStore(dbSubfieldName, KeyPath);

    const message = {
      Action: 'DB.Create',
      DBName: dbName,
      DBSubfieldName: dbSubfieldName,
      QueryString: KeyPath
    };
    sendServer(message, self);
  };

  open.onsuccess = function(result) {
    console.log('data opened');
    callback(null, getResponse('DBCreateDone',
      'Database creation done.', result));
  };

  open.onerror = function(error) {
    callback(getResponse('DBCreateFailed',
      'Error happened while trying to create database',
      error), null);
  };
};

SHubSub.prototype.deleteDB = function(dbName, dbSubfieldName, callback) {
  const open = indexedDB.open(dbName, 1);
  open.onsuccess = function() {
    const db = open.result;
    db.close(); // all db connection must be closed before deleteDatabase.

    const req = indexedDB.deleteDatabase(dbName);

    req.onsuccess = function(result) {
      console.log('DB deleted');
      const message = {
        Action: 'DB.Delete',
        DBName: dbName,
        DBSubfieldName: dbSubfieldName
      };
      sendServer(message, self);
      callback(null, getResponse('DBDeleteDone',
        'Database deletion done',
        result));
    };
    req.onblocked = function(result) {
      callback(getResponse('DBDeleteBlocked',
        'Database deletion blocked',
        result), null);
    };
    req.onerror = function(error) {
      callback(getResponse('DBDeleteFailed',
        'Error happened while trying to delete database',
        error), null);
    };
  };
  open.onerror = function(error) {
    callback(getResponse('DBDeleteFailed',
      'Error happened while opening database for deletion',
      error), null);
  };
};

SHubSub.prototype.addRecord = function(dbName, dbSubfieldName, rec, callback) {
  const open = indexedDB.open(dbName, 1);
  const self = this;
  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(dbSubfieldName, 'readwrite');
    const store = tx.objectStore(dbSubfieldName);

    const now = new Date();
    rec.timeStamp = now.toISOString().slice(0, -5) + 'Z';

    const keyValue = getKeyValue(store.keyPath, rec);
    const keyString = {};
    keyString[store.keyPath] = keyValue;

    const req = store.get(keyValue);
    req.onsuccess = function(event) {
      const result = event.target.result;

      if (result === null) {
        const res = store.add(rec);

        res.onsuccess = function(event) {
          console.log('added record: ' + JSON.stringify(rec));
          const message = {
            Action: 'Add',
            DBName: dbName,
            DBSubfieldName: dbSubfieldName,
            QueryString: {
              Key: keyString,
              Added: rec
            }
          };
          sendServer(message, self);
          callback(null, getResponse('RecordAddDone',
            'Record adding done', event));
        };
        res.onerror = function(err) {
          callback(getResponse('RecordAddFailed',
            'Record adding failed', err), null);
        };
      } else {
        callback(getResponse('RecordAddFailed',
          'The record already exists', null), null);
      }
    };
  };
  open.onerror = function(error) {
    callback(getResponse('RecordAddFailed',
      'Error happened while opening database for record added',
      error), null);
  };
};

SHubSub.prototype.deleteRecord = function(dbName, dbSubfieldName, keyValue, callback) {
  const open = indexedDB.open(dbName, 1);
  const self = this;

  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(dbSubfieldName, 'readwrite');
    const store = tx.objectStore(dbSubfieldName);

    const keyString = {};
    keyString[store.keyPath] = keyValue;

    const req = store.get(keyValue);
    req.onsuccess = function(event) {
      const result = event.target.result;

      if (result) {
        const res = store.delete(keyValue);

        res.onsuccess = function() {
          console.log('deleted record with ' + keyValue);
          const message = {
            Action: 'Delete',
            DBName: dbName,
            DBSubfieldName: dbSubfieldName,
            QueryString: {Key: keyString}
          };
          sendServer(message, self);
          callback(null, getResponse('RecordDeleteDone',
            'Record deletion done', null));
        };

        res.onerror = function(err) {
          callback(getResponse('RecordDeleteFailed',
            'Error happened while deleting record', err), null);
        };
      } else {
        callback(getResponse('RecordDeleteFailed',
          'The record does not exist.', null), null);
      }
    };
  };
  open.onerror = function(error) {
    callback(getResponse('RecordDeleteFailed',
      'Error happened while opening for record deleted',
      error), null);
  };
};

SHubSub.prototype.modifyRecord = function(dbName,
  dbSubfieldName,
  keyValue,
  modified,
  callback) {
  const open = indexedDB.open(dbName, 1);
  const self = this;

  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(dbSubfieldName, 'readwrite');
    const store = tx.objectStore(dbSubfieldName);

    const keyString = {};
    keyString[store.keyPath] = keyValue;

    const cursorQuery = store.openCursor(keyValue);
    cursorQuery.onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        const updateValue = cursor.value;
        for (let mValue in modified) {
          for (let field in updateValue) {
            if (field === mValue) {
              updateValue[field] = modified[mValue];
              break;
            }
          }
        }
        const now = new Date();
        updateValue.timeStamp = now.toISOString().slice(0, -5) + 'Z';
        cursor.update(updateValue);
        console.log('modified record with ' + keyValue +
                    ' modified values are ' + JSON.stringify(modified));

        // modifying time stamp of the row
        modified.timeStamp = updateValue.timeStamp;

        const message = {
          Action: 'Modify',
          DBName: dbName,
          DBSubfieldName: dbSubfieldName,
          QueryString: {
            Key: keyString,
            Modified: modified
          }
        };
        sendServer(message, self);
        callback(null, getResponse('RecordModifyDone',
          'Record modification done', null));
      } else {
        callback(getResponse('RecordModifyFailed',
          'The record does not exist.', null), null);
      }
    };

    cursorQuery.onerror = function(event) {
      callback(getResponse('RecordModifyFailed',
        'Error happend while opening cursor', event), null);
    };
  };
  open.onerror = function(error) {
    callback(getResponse('RecordModifyFailed',
      'Error happened while opening database for record modified',
      error), null);
  };
};

SHubSub.prototype.readDBAll = function(dbName, dbSubfieldName, callback) {
  const open = indexedDB.open(dbName, 1);
  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(dbSubfieldName, 'readwrite');
    const store = tx.objectStore(dbSubfieldName);

    const req = store.getAll();
    req.onsuccess = function(event) {
      if (event.target.result.length) {
        event.target.result.forEach(function(data) {
          callback(null, data);
        });
      } else {
        callback(null, {});
      }
    };

    req.onerror = function(error) {
      callback(getResponse('RecordReadFailed',
        'Error happended while get database for reading', error), null);
    };
  };

  open.onerror = function(error) {
    callback(getResponse('RecordReadFailed',
      'Error happended while opening database for reading', error), null);
  };
};

SHubSub.prototype.readDBOne = function(dbName, dbSubfieldName, keyValue, callback) {
  const open = indexedDB.open(dbName, 1);
  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(dbSubfieldName, 'readwrite');
    const store = tx.objectStore(dbSubfieldName);

    const req = store.get(keyValue);
    req.onsuccess = function(event) {
      const result = event.target.result;
      if (result) {
        callback(null, result);
      } else {
        callback(getResponse('RecordReadFailed',
          'The record was not found', null), null);
      }
    };
  };

  open.onerror = function(error) {
    callback(getResponse('RecordReadFailed',
      'Error happended while opening database for reading',
      error), null);
  };
};


function sendServer(message, self) {
  if (self.connection === null) {
    console.log('You\'ve got lost connection.');
    return;
  }
  self.connection.send(JSON.stringify(message));
}

function messageClient(receiveMessage, self, callback) {
  const message = JSON.parse(receiveMessage);

  switch (message.Action) {
  case 'DB.Create': {
    dbCreate(message, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
    break;
  }
  case 'DB.Delete': {
    dbDelete(message, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
    break;
  }
  case 'Add': {
    recordAdd(message, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
    break;
  }
  case 'Delete': {
    recordDelete(message, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
    break;
  }
  case 'Modify': {
    recordModify(message, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
    break;
  }
  case 'Sync': {
    synchronization(message, self, function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
    break;
  }
  default:
    break;
  }
}

function dbCreate(message, callback) {
  const open = indexedDB.open(message.DBName, 1);

  open.onupgradeneeded = function() {
    const db = open.result;
    const key = message.QueryString.keyPath;
    const store = db.createObjectStore(message.DBSubfieldName, {keyPath: key});
  };

  open.onsuccess = function(result) {
    console.log(message.DBName + ' created, ObjectStore: ' +
                message.DBSubfieldName);
    callback(null, getResponse('DBCreateDone',
      'Database creation done.', result));
  };

  open.onerror = function(error) {
    callback(getResponse('DBCreateFailed',
      'Error happened while trying to create database',
      error), null);
  };
}

function dbDelete(message, callback) {
  const open = indexedDB.open(message.DBName, 1);
  open.onsuccess = function() {
    const db = open.result;
    db.close(); // all db connection must be closed before deleteDatabase.

    const req = indexedDB.deleteDatabase(message.DBName);

    req.onsuccess = function(result) {
      callback(null, getResponse('DBDeleteDone',
        'Database deletion done', result));
    };
    req.onblocked = function(result) {
      callback(getResponse('DBDeleteBlocked',
        'Database deletion blocked', result), null);
    };
    req.onerror = function(error) {
      callback(getResponse('DBDeleteFailed',
        'Error happened while trying to delete database',
        error), null);
    };
  };
  open.onerror = function(error) {
    callback(getResponse('DBDeleteFailed',
      'Error happened while opening database for deletion',
      error), null);
  };
}

function recordAdd(message, callback) {
  const open = indexedDB.open(message.DBName, 1);
  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(message.DBSubfieldName, 'readwrite');
    const store = tx.objectStore(message.DBSubfieldName);

    const query = JSON.parse(JSON.stringify(message.QueryString));
    const keyValue = getKeyValue(store.keyPath, query.Key);

    const req = store.get(keyValue);
    req.onsuccess = function(event) {
      const result = event.target.result;

      if (result === null) {
        const res = store.add(query.Added);

        res.onsuccess = function(event) {
          callback(null, getResponse('RecordAddDone',
            'Record adding done', event));
        };
        res.onerror = function(err) {
          callback(getResponse('RecordAddFailed',
            'Record adding failed', err), null);
        };
      } else {
        callback(getResponse('RecordAddFailed',
          'The record already exists', null), null);
      }
    };
  };
  open.onerror = function(error) {
    callback(getResponse('RecordAddFailed',
      'Error happened while opening database for record added',
      error), null);
  };
}

function recordDelete(message, callback) {
  const open = indexedDB.open(message.DBName, 1);
  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(message.DBSubfieldName, 'readwrite');
    const store = tx.objectStore(message.DBSubfieldName);

    const query = JSON.parse(JSON.stringify(message.QueryString));
    const keyValue = getKeyValue(store.keyPath, query.Key);

    const req = store.get(keyValue);
    req.onsuccess = function(event) {
      const result = event.target.result;

      if (result) {
        const res = store.delete(keyValue);

        res.onsuccess = function() {
          callback(null, getResponse('RecordDeleteDone',
            'Record deletion done', null));
        };

        res.onerror = function(err) {
          callback(getResponse('RecordDeleteFailed',
            'Error happened while deleting record',
            err), null);
        };
      } else {
        callback(getResponse('RecordDeleteFailed',
          'The record does not exist.', null), null);
      }
    };
  };
  open.onerror = function(error) {
    callback(getResponse('RecordDeleteFailed',
      'Error happened while opening for record deleted',
      error), null);
  };
}

function recordModify(message, callback) {
  const open = indexedDB.open(message.DBName, 1);
  open.onsuccess = function() {
    const db = open.result;
    const tx = db.transaction(message.DBSubfieldName, 'readwrite');
    const store = tx.objectStore(message.DBSubfieldName);

    const query = JSON.parse(JSON.stringify(message.QueryString));
    const keyValue = getKeyValue(store.keyPath, query.Key);

    const cursorQuery = store.openCursor(keyValue);
    cursorQuery.onsuccess = function(event) {
      const cursor = event.target.result;
      if (cursor) {
        const updateValue = cursor.value;
        const modified = query.Modified;
        for (let mValue in modified) {
          for (let field in updateValue) {
            if (field === mValue) {
              updateValue[field] = modified[mValue];
              break;
            }
          }
        }
        cursor.update(updateValue);
        callback(null, getResponse('RecordModifyDone',
          'Record modification done', null));
      } else {
        callback(getResponse('RecordModifyFailed',
          'The record does not exist.', null), null);
      }
    };

    cursorQuery.onerror = function(event) {
      callback(getResponse('RecordModifyFailed',
        'Error happend while opening cursor', event), null);
    };
  };
  open.onerror = function(error) {
    callback(getResponse('RecordModifyFailed',
      'Error happened while opening database for record modified',
      error), null);
  };
}

function synchronization(receiveMessage, self, callback) {
  switch (receiveMessage.SyncInfo) {
  case 'DBInfo': {
    const open = indexedDB.open(receiveMessage.DBName, 1);
    open.onupgradeneeded = function() {
      console.log('upgrade needed');
      const db = open.result;
      const store = db.createObjectStore(receiveMessage.DBSubfieldName, receiveMessage.KeyPath);
    };

    open.onsuccess = function() {
      console.log('DB: '+receiveMessage.DBName+' opened');
    };
    break;
  }

  case 'Record': {
    const open = indexedDB.open(receiveMessage.DBName, 1);
    const preventAnonymous = true;

    open.onupgradeneeded = function(event) {
      preventAnonymous = false;
    };
    open.onsuccess = function() {
      if (!preventAnonymous) {
        return;
      }
      const db = open.result;
      const tx = db.transaction(receiveMessage.DBSubfieldName, 'readwrite');
      const store = tx.objectStore(receiveMessage.DBSubfieldName);

      if (self.lastSyncTime === 0) {
        receiveMessage.RecordData.forEach(function(receiveData) {
          const req = store.put(receiveData);
          req.onerror = function(error) {
            console.error(error);
          };

          req.onsuccess = function() {
            callback(null, getResponse('RecordModifyDone',
              'Records added by synchronization', receiveData));
          };
        });
        const message = {
          Action: 'Sync',
          SyncInfo: 'End'
        };
        sendServer(message, self);
      } else {
        // Server -> Client
        receiveMessage.RecordData.forEach(function(receiveData) {
          if (self.lastSyncTime < receiveData.timeStamp) {// add in client db
            const req = store.get(receiveData[store.keyPath]);
            req.onsuccess = function(event) {
              if (!event.target.result ||
                event.target.result.timeStamp <= receiveData.timeStamp) {
                const reqChild = store.put(receiveData);
                reqChild.onerror = function(error) {
                  console.error(error);
                };

                reqChild.onsuccess = function() {
                  callback(null, getResponse('RecordModifyDone',
                    'Records modified by synchronization', receiveData));
                };
              } else {
                const keyString = {};
                keyString[store.keyPath] = event.target.result[store.keyPath];
                delete event.target.result[store.keyPath];
                const message = {
                  Action: 'Modify',
                  DBName: receiveMessage.DBName,
                  DBSubfieldName: receiveMessage.DBSubfieldName,
                  QueryString: {
                    Key: keyString,
                    Modified: event.target.result
                  }
                };
                sendServer(message, self);
              }
            };
          } else {
            const req = store.get(receiveData[store.keyPath]);
            req.onsuccess = function(event) {
              if (!event.target.result) { // delete in server db
                const message = {
                  Action: 'Delete',
                  DBName: receiveMessage.DBName,
                  DBSubfieldName: receiveMessage.DBSubfieldName,
                  QueryString: {Key: receiveData}
                };
                sendServer(message, self);
              } else if (event.target.result.timeStamp
                         !== receiveData.timeStamp) { // modify in server db
                const keyString = {};
                keyString[store.keyPath] = event.target.result[store.keyPath];
                delete event.target.result[store.keyPath];
                const message = {
                  Action: 'Modify',
                  DBName: receiveMessage.DBName,
                  DBSubfieldName: receiveMessage.DBSubfieldName,
                  QueryString: {
                    Key: keyString,
                    Modified: event.target.result
                  }
                };
                sendServer(message, self);
              }
            };
            req.onerror = function(error) {
              console.error(error);
            };
          }
        });

        // Client -> Server
        const req = store.getAll();
        req.onsuccess = function(event) {
          const clientDataList = event.target.result;
          receiveMessage.RecordData.forEach(function(receiveData) {
            clientDataList.forEach(function(clientData, index) {
              if (clientData[store.keyPath] === receiveData[store.keyPath]) {
                clientDataList.splice(index, 1);
              }
            });
          });
          clientDataList.forEach(function(clientData) {
            if (clientData.timeStamp <= self.lastSyncTime ) { // delete in client db
              const req = store.delete(clientData[store.keyPath]);
              req.onsuccess = function() {
                callback(null, getResponse('RecordDeleteDone',
                  'Record deletion done', clientData[store.keyPath]));
              };
            } else { // add server db
              const message = {
                Action: 'Add',
                DBName: receiveMessage.DBName,
                DBSubfieldName: receiveMessage.DBSubfieldName,
                QueryString: {
                  Key: {[store.keyPath]: clientData[store.keyPath]},
                  Added: clientData
                }
              };
              sendServer(message, self);
            }
          });
          // end sync
          const message = {
            Action: 'Sync',
            SyncInfo: 'End'
          };
          sendServer(message, self);
        };
        req.onerror = function(error) {
          console.error(error);
        };
      }
    };
    open.onerror = function(error) {
      console.error(error);
    };
    break;
  }

  case 'End': {
    const openSyncDB = indexedDB.open('SyncDataBase', 1);

    openSyncDB.onsuccess = function(event) {
      const db = openSyncDB.result;
      const tx = db.transaction('SyncDataObject', 'readwrite');
      const store = tx.objectStore('SyncDataObject');
      const rec = {
        _id: self._ID_LST,
        LastSync: receiveMessage.LastSync
      };

      const req = store.put(rec);
      req.onsuccess = function() {
        self.lastSyncTime = receiveMessage.LastSync;

        callback(null, 'sync done');
      };
    };
    break;
  }
  }
}

function getKeyValue(keyPath, key) {
  let keyValue;
  for (let v in key) {
    if (v === keyPath) {
      keyValue = key[v];
      break;
    }
  }
  return keyValue;
}

function getResponse(stat, resp, det) {
  const res = {
    status: stat,
    response: resp,
    detail: det
  };
  return res;
}
