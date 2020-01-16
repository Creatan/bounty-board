/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import dotenv from 'dotenv'

import Bounty from '../server/models/bounty'
import Team from '../server/models/team'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P });
(async () => {
  const bounties = await Bounty.find({ division: { $exists: false } }).exec()
  await P.all(bounties.map(async (bounty) => {
    const team = await Team.findOne({ id: bounty.team.id }).exec()
    return Bounty.updateOne({ _id: bounty._id }, { $set: { division: team.division } })
  }))
  mongoose.connection.close()
})()
