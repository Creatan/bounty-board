/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import dotenv from 'dotenv'

import Bounty from '../server/models/bounty'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P, useUnifiedTopology: true });
(async () => {
  const bountyBase = await Bounty.findOne({}).exec()

  const { _id, __v, ...bountyData } = bountyBase.toObject()
  let counter = 0
  const promises = []
  while (counter < 50) {
    promises.push(new Bounty(bountyData).save())
    counter += 1
  }
  await P.all(promises)
  mongoose.connection.close()
})()
