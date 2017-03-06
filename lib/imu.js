/*!
 * matrix-malos-connector-js
 * MIT Licensed
 */

'use strict'

const EventEmitter = require('events')
const Root = require("protobufjs").Root
const Malos = require('../lib/malos')

const _DEFAULT_OPTIONS = {
  // MALOS service host
  host: '127.0.0.1',
  // MALOS service IMU base (config) port
  port: 20013,
  // How frequenly to ping
  pingInterval: 5000,

  // Protocol Buffer stuff
  proto: {
    filePath: __dirname + '/../protocol-buffers/malos/driver.proto',
    configMessage: 'matrix_malos.DriverConfig',
    dataMessage: 'matrix_malos.Imu',
  }
}

class ImuService extends Malos {
  constructor(opts) {
    let options = Object.assign(_DEFAULT_OPTIONS, opts)
    super(options)

    // Protobuf init
    let root = new Root()
    root.loadSync(options.proto.filePath)
    this.ConfigProto = root.lookup(options.proto.configMessage)
    this.DataProto = root.lookup(options.proto.dataMessage)
    this.setPingInterval(options.pingInterval)
  }

  /**
  * Encodes a Javascript Object into a DriverConfig protocol-buffer
  * message as expected by MALOS configuration
  *
  * @param {Object} [msg] Javascript object to convert
  * @returns {DriverConfig} Protocol Buffer message
  */
  encodeConfigMessage(msg) {
    var protoMsg = this.ConfigProto.create(msg)
    return this.ConfigProto.encode(protoMsg).finish()
  }

  /**
  * Decodes a Pressure Protocol buffer message
  *
  * @param {Pressure} [msg] Pressure Protocol Buffer
  * @returns {Object} decoded Pressure protocol buffer
  */
  decodeDataMessage(msg) {
    return this.DataProto.decode(msg)
  }
}

// Module Exports
module.exports = ImuService
