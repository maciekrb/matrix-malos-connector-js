# MATRIX Creator MALOS connector for NodeJS

Minimalist wrapper around [MATRIX Creator MALOS][1].

The main purpose of this module is making it easy to expose the **MATRIX Creator MALOS** protocol over different protocols (ie. [MQTT][2]) for integration with services like [AWS IoT][3].

## Pressure Service
```js
const PressureService = require('matrix-malos-connector').Pressure

// Just instance and get data, all ZeroMQ handling
// is done for you
let pressure = new PressureService()
pressure.on('data', (msg) => {
  // msg is a serialized protocol buffer, you can either
  // send it as a proto or decode it easily
  let msg = JSON.stringify(pressure.decodeDataMessage(proto))
  console.log(msg)
})

pressure.on('error', (err) => {
  console.log('Pressure driver failed', err)
})

// Update the rate a which data is updated
// (as defined in protocol-buffers/matrix/malos/driver.DriverConfig)
let conf = {
  delay_between_updates: 5.0,  // segs
  timeout_after_last_ping: 7.0 // segs
}
let pressureConf = pressureService.encodeConfigMessage(conf)
pressureService.setDriverConfig(pressureConf)
```

## IMU Service
```js
const ImuService = require('matrix-malos-connector').Imu

// Just instance and get data, all ZeroMQ handling
// is done for you
let imu = new ImuService()
imu.on('data', (msg) => {
  // msg is a serialized protocol buffer, you can either
  // send it as a proto or decode it easily
  let msg = JSON.stringify(imu.decodeDataMessage(proto))
  console.log(msg)
})

imu.on('error', (err) => {
  console.log('IMU driver failed', err)
})
```

## Integrating with AWS IoT

Exposing the MALOS services via AWS IoT MQTT is really simple:

```sh
$ npm install --save aws-iot-device-sdk
```

```js
// AWS SDK Device
const Device = require('aws-iot-device-sdk').device
// Inertial measurment unit service init
const ImuService = require('./services/imu')

// Init the AWS IoT Device, you will get most of these configs from the
// AWS Developer console
let device = Device({
  // From AWS IoT console
  keyPath: 'path/to/your-secret.key',
  certPath: '/path/to/your-cert.pem',
  caPath: '/path/to/ca-cert.pem',
  host: 'xxxxxxxx.iot.us-east-1.amazonaws.com',
  // Some more conf
  clientId: 'My IoT device',
  region: 'us-east-1',
  baseReconnectTimeMs: 4000,
  keepalive: 30,
  protocol: 'mqtts',
  port: 8883,
})

// Init the Inertial Measurment Unit service
var imu = new ImuService()

// Send data to AWS IoT via MQTT as it comes from the service
imu.on('data', (proto) => {
  // Comment this line to send serialized protocol buffers
  var msg = JSON.stringify(imu.decodeDataMessage(proto))
  // Publish to the data topic on AWS IoT
  device.publish('mytopic/Imu/data', msg)
})
imu.on('error', (err) => {
  console.error(err)
  // Publish to the error topic on AWS IoT
  device.publish('mytopic/Imu/error')
})

// Show some output on interesting AWS IoT device events
device.on('connect', () => {
  console.log('AWS IoT Device connected')
})
device.on('close', () => {
  console.log('AWS IoT Device closed connection')
})

// Reacting to configuration sent from other MQTT clients
device.subscribe('mytopic/Imu/config')
device.on('message', (topic, payload) => {
  console.log('Incoming AWS IoT message (%s) ', topic, payload.toString());

  switch(topic) {
    // Incoming messages from subscriptions above are
    // mapped here
    case 'mytopic/Imu/config':
      // Comment this line if your remote systems are sending
      // serialized protocol buffer messages
      let imuConf = imu.encodeConfigMessage(payload)
      imu.setDriverConfig(imuConf)
      break

    ...

    default:
      console.log('Could not map topic to proto', topic)
      break;
  }
});
```

[1]: https://github.com/matrix-io/matrix-creator-malos
[2]: http://mqtt.org/
[3]: https://aws.amazon.com/iot/
