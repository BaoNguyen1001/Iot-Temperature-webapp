const { json } = require('body-parser');
const mqtt = require('mqtt');

const dataTest = require('../data/data');
const TempHumiModel = require("../models/tempHumi.model");

const mqttSocketController = (io) => {
  const client = mqtt.connect("mqtt://172.20.10.4:1883", {clientId: "mqtt-nodejs-server"});

  client.on('connect', function() {
    client.subscribe('sensor/update', () => {
      console.log("Subscribed to sensor/update topic");
    })
  });
  
  client.on('error', function(error) {
    console.log("Unable to connect: " + error);
    process.exit(1);
  });

  client.on('message', async function (topic, message) {
    if(topic === 'sensor/update') {
      // Handler data before INSERT into Database
      // item format: {Temp, Humi, Ts}
      //const item = message.toJSON();
      var item = JSON.parse(message.toString());
      item.Ts *= 1000;
      console.log("Add a record: ", item);
      await TempHumiModel.add(item);
      
      //io.emit('update') -> push data to web
      TempHumiModel.getLastRecord((err, data) => {
        if (err) {
          throw err;
        }
        io.emit("update", data);
        console.log("Data have been updated");
      })
      
    }
  });

  io.on("connection", (socket) => {
    console.log("New connection is connected");

    socket.on('load', (msg) => {
      //get default data from model
      TempHumiModel.get10LastRecord((err, data) => {
        if (err) {
          throw err;
        }
        //io.emit('load') -> push data to web
        io.emit('load', data);
      })
      
    });

    socket.on('update', (msg) => {
      console.log(msg);
    })
  })

  // dataTest.map((item) => {
  //   TempHumiModel.add(item);
  // })

}





module.exports = mqttSocketController;


