const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const DBConnection = require('./src/configs/db.config');
const Controller = require('./src/controllers/controller');

DBConnection.connection();


Controller(io);


app.use(express.static(path.join(__dirname + '/client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client', 'index.html'));
})

http.listen(3000, () => {
  console.log('Server is listening on port ' + 3000);
})
