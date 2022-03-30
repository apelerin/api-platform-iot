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
}
