
/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import request from 'request-promise'
import dotenv from 'dotenv'

import Season from '../server/models/season'
import Team from '../server/models/team'
import { delay } from '../server/utils'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P, useUnifiedTopology: true });

(async () => {
  const season = await Season.findOne({ active: true }).exec()
  if (!season) {
    console.log('No active seasons')
    process.exit(1)
  }
  try {
    const teams = await Team.find({ seasons: season.identifier }).exec()
    await P.map(teams, (async (team) => {
      console.log(`updating team ${team.id}`)
      const rosterUrl = `https://rebbl.net/api/v2/team/${team.id}/players`
      const roster = await request.get(rosterUrl, { json: true })

      const players = roster ? roster.map(player => ({
        id: player.id, name: player.name,
      })) : []
      await Team.updateOne({ id: team.id }, { $set: { roster: players } }).exec()
      await delay(100)
    }), { concurrency: 1 })
  } catch (err) {
    console.log(err)
  }
  mongoose.connection.close()
})()
