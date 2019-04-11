const MongoDbHandler = require('./DataBases/MongoDBHandler');

function DataBaseHandler(dataBaseType, databaseUrl) {
  if (dataBaseType === 'MongoDB') {
    if (this.dbHandler === null) {
      this.dbHandler = new MongoDbHandler(databaseUrl);
    }
    return this;
  } else {
    console.error(`${dataBaseType} is not supported on current version`);
    // TODO: generate instance for MySQL
  }
}

DataBaseHandler.prototype.handleParams = function(params, callback) {
  switch (params.Action) {
  case 'DB.Create':
    this.dbHandler.dbCreate(params, callback);
    break;
  case 'DB.Delete':
    this.dbHandler.dbDelete(params, callback);
    break;
  case 'Add':
    this.dbHandler.recordAdd(params, callback);
    break;
  case 'Delete':
    this.dbHandler.recordDelete(params, callback);
    break;
  case 'Modify':
    this.dbHandler.recordModify(params, callback);
    break;
  case 'Sync':
    this.dbHandler.synchronization(params, callback);
    break;
  }
};

module.exports = DataBaseHandler;
