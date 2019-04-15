const mongoClient = require('mongodb').MongoClient;

function MongoDBHandler(url) {
  this.dbUrl = url;
  if (this.dbUrl.charAt(this.dbUrl.length-1) !== '/') {
    this.dbUrl += '/';
  }

  const now = new Date();
  this.lastUpdateTime = now.toISOString().slice(0, -5) + 'Z';
}

MongoDBHandler.prototype.getDBType = function() {
  return 'MongoDB';
};

MongoDBHandler.prototype.dbCreate = function(params, callback) {
  const self = this;
  mongoClient.connect(self.dbUrl + params.DBName, function(connectErr, db) {
    if (connectErr) {
      console.error('MongoDB connection failed: ' +
                    params.DBName + ' err: ' + connectErr);
      return;
    }

    mongoClient.connect(self.dbUrl+'SyncDatabase', function(connErr, syncDb) {
      if (connErr) {
        console.error('Database error description: ' + connErr);
        return;
      }

      const syncColl = syncDb.collection('SyncDataCollection');
      const query = {
        DBName: params.DBName,
        DBSubfieldName: params.DBSubfieldName,
        KeyPath: params.QueryString,
      };

      const cursor = syncColl.find(query);
      cursor.count(function(err, cnt) {
        if (err) {
          console.error('Database error description: ' + err);
          return;
        } else if (cnt === 0) {
          syncColl.insert(query, function(err, result) {
            if (err) {
              console.error('Database error description: ' + err);
              return;
            }
            console.log(`The Database Insertion success: ${JSON.stringify(result)}`);
            self.sendSyncEnd(callback);
          });
        } else {
          console.log(`The ${params.DBName} is already existing.`);
        }
      });
    });
  });
};

MongoDBHandler.prototype.dbDelete = function(params, callback) {
  const self = this;
  mongoClient.connect(self.dbUrl + params.DBName, function(connectErr, db) {
    if (connectErr) {
      console.error('MongoDB connection failed: ' + params.DBName + ' err: ' + connectErr);
      return;
    }

    db.dropDatabase(function(err, result) {
      if (err) {
        console.error('Database error description: ' + err);
        return;
      }
      console.log(`The Database Dropped success: ${JSON.stringify(result)}`);
      self.sendSyncEnd(callback);
    });
  });
};

MongoDBHandler.prototype.recordAdd = function(params, callback) {
  const self = this;
  mongoClient.connect(self.dbUrl + params.DBName, function(connectErr, db) {
    if (connectErr) {
      console.error('MongoDB connection failed: ' + params.DBName + ' err: ' + connectErr);
      return;
    }

    const collection = db.collection(params.DBSubfieldName);
    const query = JSON.parse(JSON.stringify(params.QueryString));
    const cursor = collection.find(query.Key);

    cursor.count(function(countErr, cnt) {
      if (countErr) {
        console.error('Database error description: ' + countErr);
        return;
      } else if (cnt === 0) {
        collection.insert(query.Added, function(err, insertResult) {
          if (err) {
            console.error('Database error description: ' + err);
            return;
          }
          collection.findOne(query.Key, function(err, result) {
            if (err) {
              console.error('Database error description: ' + err);
              return;
            }
            console.log(`The record Added: ${JSON.stringify(result)}`);
          });
          self.sendSyncEnd(callback);
        });
      } else {
        console.log(`The record is already existing: ${JSON.stringify(query.Key)}`);
      }
    });
  });
};

MongoDBHandler.prototype.recordDelete = function(params, callback) {
  const self = this;
  mongoClient.connect(self.dbUrl + params.DBName, function(connectErr, db) {
    if (connectErr) {
      console.error('MongoDB connection failed: ' +
                    params.DBName + ' err: ' + connectErr);
      return;
    }

    const collection = db.collection(params.DBSubfieldName);
    const query = JSON.parse(JSON.stringify(params.QueryString));
    const cursor = collection.find(query.Key);

    cursor.count(function(countErr, cnt) {
      if (countErr) {
        console.error('Database error description: ' + countErr);
      } else if (cnt === 0) {
        console.log(`The record Not found: ${JSON.stringify(query.Key)}`);
        return;
      } else {
        collection.findOne(query.Key, function(err, deleteData) {
          if (err) {
            console.error('Database error description: ' + err);
            return;
          }
          collection.remove(query.Key, {safe: true}, function(err, result) {
            if (err) {
              console.error('Database error description: ' + err);
              return;
            }
            console.log(`The record Deleted: ${JSON.stringify(deleteData)}`);
            self.sendSyncEnd(callback);
          });
        });
      }
    });
  });
};

MongoDBHandler.prototype.recordModify = function(params, callback) {
  const self = this;
  mongoClient.connect(self.dbUrl + params.DBName, function(connectErr, db) {
    if (connectErr) {
      console.log('MongoDB connection failed: ' + params.DBName + ' err: ' + connectErr);
      return;
    }
    const collection = db.collection(params.DBSubfieldName);
    const query = JSON.parse(JSON.stringify(params.QueryString));
    const cursor = collection.find(query.Key);

    cursor.count(function(countErr, cnt) {
      if (countErr) {
        console.error('Database error description: ' + countErr);
      } else if (cnt === 0) {
        console.log(`The record Not found: ${JSON.stringify(query.Key)}`);
        return;
      } else {
        collection.update(query.Key, {$set: query.Modified},
          function(err, result) {
            if (err) {
              console.error('Database error description: ' + err);
              return;
            }
            collection.findOne(query.Key, function(err, modifiedData) {
              if (err) {
                console.error('Database error description: ' + err);
                return;
              }
              console.log(`The record Modified: ${JSON.stringify(modifiedData)}`);
              self.sendSyncEnd(callback);
            });
          });
      }
    });
  });
};

MongoDBHandler.prototype.synchronization = function(params, callback) {
  const self = this;
  if (params.SyncInfo === 'Start') {
    if (params.LastSync === 0) {
      mongoClient.connect(self.dbUrl+'SyncDatabase', function(connErr, syncDb) {
        if (connErr) {
          console.error('Database error description: ' + connErr);
          return;
        }
        const syncColl = syncDb.collection('SyncDataCollection');
        const cursor = syncColl.find();

        cursor.forEach(function(doc) {
          const msg = {
            Action: 'Sync',
            SyncInfo: 'DBInfo',
            DBName: doc.DBName,
            DBSubfieldName: doc.DBSubfieldName,
            KeyPath: doc.KeyPath
          };
          callback(JSON.stringify(msg));

          mongoClient.connect(self.dbUrl+doc.DBName, function(connectErr, db) {
            if (connectErr) {
              console.error('Database error description: ' + connectErr);
              return;
            }
            const collection = db.collection(doc.DBSubfieldName);
            collection.find().toArray(function(err, serverData) {
              if (err) {
                console.error('Database error description: ' + err);
                return;
              }
              serverData.forEach(function(data) {
                delete data._id;
              });
              const msg = {
                Action: 'Sync',
                SyncInfo: 'Record',
                DBName: doc.DBName,
                DBSubfieldName: doc.DBSubfieldName,
                RecordData: serverData
              };
              callback(JSON.stringify(msg));
            });
          });
        });
      });
    }

    if (params.LastSync > self.lastUpdateTime) {
      const msg = {
        Action: 'Sync',
        SyncInfo: 'End',
        LastSync: self.lastUpdateTime
      };
      callback(JSON.stringify(msg));
    } else if (params.LastSync <= self.lastUpdateTime) {
      mongoClient.connect(self.dbUrl+'SyncDatabase', function(connectErr, syncDb) {
        if (connectErr) {
          console.error('Database error description: ' + connectErr);
          return;
        }
        const syncColl = syncDb.collection('SyncDataCollection');
        const cursor = syncColl.find();

        cursor.forEach(function(doc) {
          mongoClient.connect(self.dbUrl+doc.DBName, function(connErr, db) {
            if (connErr) {
              console.error('Database error description: ' + connErr);
              return;
            }
            const collection = db.collection(doc.DBSubfieldName);
            collection.find().toArray(function(err, serverData) {
              if (err) {
                console.error('Database error description: ' + err );
                return;
              }
              serverData.forEach(function(data) {
                delete data._id;
              });
              const msg = {
                Action: 'Sync',
                SyncInfo: 'Record',
                DBName: doc.DBName,
                DBSubfieldName: doc.DBSubfieldName,
                RecordData: serverData
              };
              callback(JSON.stringify(msg));
            });
          });
        });
      });
    }
  } else if (params.SyncInfo === 'End') {
    self.sendSyncEnd(callback);
  } else {
    console.error(`Wrong data: ${params.SyncInfo}`);
    return;
  }
};

MongoDBHandler.prototype.sendSyncEnd = function(callback) {
  const self = this;
  const now = new Date();
  self.lastUpdateTime = now.toISOString().slice(0, -5) + 'Z';

  const msg = {
    Action: 'Sync',
    SyncInfo: 'End',
    LastSync: self.lastUpdateTime
  };

  callback(JSON.stringify(msg));
};

module.exports = MongoDBHandler;
