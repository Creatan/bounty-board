/* eslint-disable no-console */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import P from 'bluebird'
import request from 'request-promise'

import Season from '../server/models/season'
import { delay } from '../server/utils'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P })

const season = process.argv[2]

if (!season) {
  console.log('Usage: Provide season name')
  process.exit(1)
}

(async () => {
  const leagues = ['REBBL - REL', 'REBBL - GMan', 'REBBL - Big O']
  const leagueDivisions = await P.map(leagues, async (league) => {
    const url = `https://rebbl.net/api/v2/division/${league}/${season}`
    const divisions = await request.get(url, { json: true })
    await delay(100)
    return { name: league, divisions }
  })
  await new Season({
    identifier: season,
    leagues: leagueDivisions,
  }).save()
  console.log(`Created new season with identifier: ${season}`)
  mongoose.connection.close()
})()
