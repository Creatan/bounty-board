/* eslint-disable import/prefer-default-export */
import P from 'bluebird'

const delay = ms => new P(resolve => setTimeout(resolve, ms))

export {
  delay,
}
