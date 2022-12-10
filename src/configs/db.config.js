const { connect } = require('mqtt');
var mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'temperatureDB'
});

const DBConnection = {
  conn,
  connection: () => {
    conn.connect(function(err) {
      if ( err ) {
        throw err;
      }
      console.log("Connected to MySQL Server");
    });
  }
}

module.exports = DBConnection;

