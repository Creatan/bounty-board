/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import request from 'request-promise'
import dotenv from 'dotenv'

import Season from '../server/models/season'
import Bounty from '../server/models/bounty'
import { delay } from '../server/utils'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P, useUnifiedTopology: true })

const requirementToInjuries = (requirement) => {
  switch (requirement) {
    case 'Dead': return ['Dead']
    case 'Niggled': return ['DamagedBack', 'SmashedKnee']
    case '-AG': return ['BrokenNeck']
    case '-ST': return ['SmashedCollarBone']
    case '-AV': return ['SeriousConcussion', 'FracturedSkull']
    case '-MA': return ['SmashedHip', 'SmashedAnkle']
    default: return [requirement]
  }
}

(async () => {
  const season = await Season.findOne({ active: true }).exec()
  if (!season) {
    console.log('No active seasons')
    process.exit(1)
  }
  try {
    const bounties = await Bounty.find({
      season: season.identifier,
      deleted: false,
      status: { $ne: 'claimed' },
    }).exec()
    const bountiesByTeam = bounties.filter(bounty => bounty.team.id !== null).reduce((acc, curr) => {
      const data = {
        id: curr._id,
        player: curr.player,
        requirement: curr.requirement,
      }
      if (acc[curr.team.id]) {
        acc[curr.team.id].push(data)
      } else {
        acc[curr.team.id] = [data]
      }
      return acc
    }, {})
    await P.map(Object.entries(bountiesByTeam), (async ([teamId, teamBounties]) => {
      const rosterUrl = `https://rebbl.net/api/v2/team/${teamId}/players`
      const previousPlayers = `https://rebbl.net/api/v2/team/${teamId}/retiredplayers`
      const [roster, retiredPlayers] = await P.all([request.get(rosterUrl, { json: true }), request.get(previousPlayers, { json: true })])
      const players = roster.concat(retiredPlayers).map(player => ({
        id: player.id, name: player.name, injuries: player.casualties_sustained_total || [],
      }))
      const retiredPlayerIds = retiredPlayers.map(player => player.id)
      await P.all(teamBounties.map(async (bounty) => {
        const player = players.find(p => p.id === bounty.player.id)
        const bountyInjuries = bounty.requirement.reduce((acc, curr) => acc.concat(requirementToInjuries(curr)), [])
        if (player
          && (
            player.injuries.some(injury => bountyInjuries.includes(injury))
            || (bountyInjuries.includes('Retired') && retiredPlayerIds.includes(player.id))
          )) {
          await Bounty.updateOne({ _id: bounty.id }, { status: 'claimable' }).exec()
        }
      }))
      await delay(200)
    }), { concurrency: 1 })
  } catch (err) {
    console.log(err)
  }
  mongoose.connection.close()
})()
