/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import request from 'request-promise'

import Team from '../server/models/team'
import Season from '../server/models/season'

mongoose.Promise = P
mongoose.connect('mongodb://localhost/bounty-board', { useNewUrlParser: true, promiseLibrary: P })

const season = process.argv[2]

if (!season) {
  console.log('Usage: Provide season name')
  process.exit(1)
}
const allowedLeagues = ['REBBL - REL', 'REBBL - GMan', 'REBBL - Big O']

const delay = ms => new P(resolve => setTimeout(resolve, ms));
(async () => {
  try {
    await Season.findOneAndUpdate({ identifier: season }, { identifier: season }, { upsert: true }).exec()
    const leagues = await request.get('https://rebbl.net/api/v2/league/', { json: true })
    if (allowedLeagues.every(val => leagues.includes(val))) {
      await P.map(allowedLeagues, async (league) => {
        const teams = await request.get(`https://rebbl.net/api/v2/standings/${league}/${season}`, { json: true })
        await P.map(teams, async (team) => {
          const oldTeam = await Team.findOne({ id: team.teamId }).exec()
          const url = `https://rebbl.net/api/v2/team/${team.teamId}/players`
          console.log(`Fetching data from ${url}`)
          const playerData = await request(url, { json: true })

          const roster = playerData.map(player => ({
            id: player.id,
            name: player.name,
          }))

          if (!oldTeam) {
            const newTeam = new Team({
              id: team.teamId,
              name: team.team,
              league: team.league,
              seasons: [season],
              roster,
            })

            await newTeam.save()
          } else {
            oldTeam.roster = roster
            if (!oldTeam.seasons.includes(season)) {
              oldTeam.seasons.push(season)
            }

            await oldTeam.save()
          }
          await delay(100)
        }, { concurrency: 1 })
      }, { concurrency: 1 })
    }
  } catch (err) {
    console.log(err)
  }
  mongoose.connection.close()
})()
