/*!
 * matrix-malos-connector-js
 * MIT Licensed
 */

'use strict'

const ImuService = require('./lib/imu')
const PressureService = require('./lib/pressure')

exports = module.exports = {
  Imu: ImuService,
  Pressure: PressureService
}
