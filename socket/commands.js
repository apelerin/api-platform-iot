const xbee_api = require('xbee-api')
const C = xbee_api.constants;

module.exports = {
  commandLocalNI: {
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  },
  commandRemoteNI: {
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    command: "NI",
    commandParameter: [],
  },
  commandATLowD01: {
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "D1",
    commandParameter: [C.PIN_MODE.D1.DIGITAL_OUTPUT_LOW],
  },
  commandATHighD01: {
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "D1",
    commandParameter: [C.PIN_MODE.D1.DIGITAL_OUTPUT_HIGH],
  },
}

module.exports.test1 = function () {

}
