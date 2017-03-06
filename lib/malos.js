/*!
 * matrix-malos-js
 * MIT Licensed
 */

'use strict'

const EventEmitter = require('events')
const zmq = require('zmq')

class Malos extends EventEmitter {
  constructor(options) {
    super()
    this.host = options.host
    this.port = options.port

    // Bind to MALOS error port to emit errors
    this.errorSocket = zmq.socket('sub')
    this.errorSocket.connect('tcp://' + this.host + ':' + (this.port + 2))
    this.errorSocket.subscribe('')
    this.errorSocket.on('message', (error_message) => {
      this.emit('error', error_message.toString('utf8'))
    })

    // Bind to MALOS config port to send configurations
    this.configSocket = zmq.socket('push')
    this.configSocket.connect('tcp://' + this.host + ':' + this.port)

    // Bind to MALOS data update port
    this.updateSocket = zmq.socket('sub')
    this.updateSocket.connect('tcp://' + this.host + ':' + (this.port + 3))
    this.updateSocket.subscribe('')
    this.updateSocket.on('message', (msg) => {
      this.emit('data', msg) // serialized proto
    })

    // Init MALOS Ping vars
    this.pingSocket = null
    this.pingInterval = null
  }

  /**
  * Sends given configuration to MALOS Config port
  *
  * @param {DriverConfig} [conf] DriverConfig.proto
  */
  setDriverConfig(conf) {
    this.configSocket.send(conf)
  }

  /**
  * Sets the driver ping interval
  *
  * @param {integer} [interval] driver ping interval in ms
  */
  setPingInterval(interval) {
    if (!interval) {
      return
    }

    if (!this.pingSocket) {
      // Bind to MALOS ping port to keep the service alive
      this.pingSocket = zmq.socket('push')
      this.pingSocket.connect('tcp://' + this.host + ':' + (this.port + 1))
      this.pingSocket.send('') // Ping the first time.
    }

    // Crear previous ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }

    // Set the ping interval
    this.pingInterval = setInterval(() => {
      this.pingSocket.send('')
    })
  }
}

module.exports = Malos
