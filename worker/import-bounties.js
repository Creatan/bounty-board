/* eslint-disable no-console */
import mongoose from 'mongoose'
import fs from 'fs'
import P from 'bluebird'
import dotenv from 'dotenv'

import Bounty from '../server/models/bounty'
import Team from '../server/models/team'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P })

const season = process.argv[2]

if (!season) {
  console.log('Usage: Provide season name')
  process.exit(1)
}

(async () => {
  const bounties = JSON.parse(fs.readFileSync('./bounties.json'))
  await P.all(bounties.map(async (bounty) => {
    const newBounty = {
      league: bounty.League,
      provider: {
        name: bounty['Who placed it'],
      },
      prize: bounty.Prize,
      requirement: bounty.Requirement,
      reason: bounty.Reason,
      claimed: !!bounty.Claimed,
      season,
    }
    const team = await Team.findOne({ name: bounty.Team }).exec()

    if (team) {
      newBounty.team = {
        id: team.id,
        name: team.name,
      }
      const player = team.roster.find(p => p.name === bounty.Player)
      if (player) {
        newBounty.player = player
      } else {
        newBounty.player = { name: bounty.Player }
      }
    } else {
      newBounty.team = {
        name: bounty.Team,
      }
      newBounty.player = { name: bounty.Player }
    }

    return new Bounty(newBounty).save()
  }))

  mongoose.connection.close()
})()
