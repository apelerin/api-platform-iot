const SerialPort = require('serialport')
const xbee_api = require('xbee-api')
const Command = require('./commands')
const C = xbee_api.constants;
const storage = require('./storage.js')
require('dotenv').config()
const http = require('http')
const Server = require('socket.io')

const SERIAL_PORT = process.env.SERIAL_PORT;

const xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: Number(process.env.SERIAL_BAUDRATE) || 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on("open", function () {
  xbeeAPI.builder.write(Command.commandLocalNI)
  xbeeAPI.builder.write(Command.commandRemoteNI)
});

// All frames parsed by the XBee will be emitted here

//storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))

const httpServer = http.createServer();
const io = new Server(httpServer, {
  // options
});
console.log("Server started");

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("test", () => {
    console.log("user disconnected");
  });
});

console.log("listening on port 3000");

httpServer.listen(3000);

xbeeAPI.parser.on("data", function (frame) {

  //on new device is joined, register it

  //on packet received, dispatch event
  //let dataReceived = String.fromCharCode.apply(null, frame.data);
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);
  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    // let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    console.log("NODE_IDENTIFICATION");
    console.log(frame.nodeIdentifier);
    //storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {

    console.log("ZIGBEE_IO_DATA_SAMPLE_RX")
    console.log(frame.analogSamples.AD0)
    //storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log(frame.nodeIdentifier)
    console.log("REMOTE_COMMAND_RESPONSE")
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});

