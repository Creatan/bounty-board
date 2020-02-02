/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import request from 'request-promise'
import dotenv from 'dotenv'

import Team from '../server/models/team'
import Season from '../server/models/season'

dotenv.config()
mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P, useUnifiedTopology: true })
const args = process.argv.slice(2)

const season = args[0]

if (!season) {
  console.log('Usage: Provide season name')
  process.exit(1)
}

const allowedLeagues = ['REBBL - REL', 'REBBL - GMan', 'REBBL - Big O']

const delay = ms => new P(resolve => setTimeout(resolve, ms));
(async () => {
  try {
    const validSeason = await Season.findOne({ identifier: season }).exec()
    if (!validSeason) {
      console.log('Season not found, check spelling or create new season with npm run create:season -- <season>')
      process.exit(1)
    }

    const leagues = await request.get('https://rebbl.net/api/v2/league/', { json: true })
    if (allowedLeagues.every(val => leagues.includes(val))) {
      await P.map(allowedLeagues, async (league) => {
        const teams = await request.get(`https://rebbl.net/api/v2/standings/${league}/${season}`, { json: true })
        await P.map(teams, async (team) => {
          const oldTeam = await Team.findOne({ id: team.teamId }).exec()
          if (!oldTeam || !oldTeam.seasons.includes(season)) {
            const url = `https://rebbl.net/api/v2/team/${team.teamId}/players`
            const playerData = await request(url, { json: true })

            const roster = playerData.map(player => ({
              id: player.id,
              name: player.name,
            }))
            if (!oldTeam) {
              const newTeam = new Team({
                id: team.teamId,
                name: team.team,
                league,
                division: team.competition,
                seasons: [season],
                roster,
              })
              await newTeam.save()
            } else {
              oldTeam.seasons.push(season)

              oldTeam.roster = roster
              oldTeam.division = team.competition
              await oldTeam.save()
            }

            await delay(100)
          }
        }, { concurrency: 1 })
      }, { concurrency: 1 })
    }
  } catch (err) {
    console.log(err)
  }
  mongoose.connection.close()
})()
