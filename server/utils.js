/* eslint-disable import/prefer-default-export */
import P from 'bluebird'

const delay = ms => new P(resolve => setTimeout(resolve, ms))

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next() }
  throw Error(403)
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.message = message
  }
}

export {
  delay,
  authenticated,
  HttpError,
}
