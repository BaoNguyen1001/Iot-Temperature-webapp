const DBConnection = require('../configs/db.config');

const TempHumiModel = {};

TempHumiModel.get10LastRecord = function(callback) {
  return DBConnection.conn.query("SELECT * FROM (SELECT * FROM temphumi ORDER BY ID DESC LIMIT 10)Var1 ORDER BY ID ASC;", callback);
}

TempHumiModel.getLastRecord = function(callback) {
  return DBConnection.conn.query("SELECT * FROM temphumi ORDER BY ID DESC LIMIT 1;", callback);
}

TempHumiModel.add = function(item, callback) {
  //const dateTime = new Date(item.Ts).toLocaleString().replace(',', '');
  return DBConnection.conn.query("INSERT INTO temphumi(Temp, Humi, Ts) value(?,?,?)", [item.Temp, item.Humi, item.Ts], callback);
};

module.exports = TempHumiModel;