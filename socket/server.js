const SerialPort = require('serialport')
const xbee_api = require('xbee-api')
const Command = require('./commands')
const C = xbee_api.constants;
const storage = require('./storage.js')
require('dotenv').config()
const button_transcription = {
  "Noir": "",
  "Blanc": "",
  "Jaune": "",
  "Bleu": "",
  "Rouge": "",
  "Vert": "",
}

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

storage.observeLaunchingGame(() => {
  console.log("Game is launching")
  storage.registerColorSequence();
  xbeeAPI.builder.write(Command.commandATHighD01)
  console.log("Door closed")
})

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
    console.log("NODE_IDENTIFICATION");
    console.log(String.fromCharCode.apply(null, frame.commandData));

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
    console.log("ZIGBEE_IO_DATA_SAMPLE_RX")
    //if (storage.isGameInProgress()) {
      const color = getKeyByValue(button_transcription, frame.remote64)
      console.log(frame.digitalSamples)
      console.log(frame.remote64)
    console.log(button_transcription)
      if (frame.digitalSamples["DIO1"] === 1 && color) {
        console.log(color + " button pressed")
        storage.addColorToSequence(color, () => {
          xbeeAPI.builder.write(Command.commandATLowD01)
          console.log("Door opened")
        })
      }
    //}


  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    const color = String.fromCharCode.apply(null, frame.commandData);
    if (color in button_transcription) {
      button_transcription[color] = frame.remote64;
    }
  } else if (C.FRAME_TYPE.NODE_IDENTIFICATION) {
    const color = String.fromCharCode.apply(null, frame.commandData);
    if (color in button_transcription) {
      button_transcription[color] = frame.remote64;
    }
  } else if (C.FRAME_TYPE.JOIN_NOTIFICATION_STATUS === frame.type) {
    console.log("REGISTER_JOINING_DEVICE_STATUS")
    const color = String.fromCharCode.apply(null, frame.commandData);
    if (color in button_transcription) {
      button_transcription[color] = frame.remote64;
    }
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }
});

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

