/* eslint-disable no-console */
import mongoose from 'mongoose'
import P from 'bluebird'
import fs from 'fs'
import request from 'request-promise'

import teamMap from './maps/team'
import Team from '../models/team'

mongoose.Promise = P
mongoose.connect('mongodb://localhost/bounty-board', { useNewUrlParser: true, promiseLibrary: P })

const teamsFile = process.argv[2]
const season = process.argv[3]

if (!teamsFile || !season) {
  console.log('Usage: Provide path to a json file with teams and a season identifier')
  process.exit(1)
}

const delay = ms => new P(resolve => setTimeout(resolve, ms))

const json = JSON.parse(fs.readFileSync(teamsFile));
(async () => {
  await P.map(json, async (team) => {
    if (team.id === null) {
      const data = teamMap.get(team.name)
      if (data) {
        team.id = data.id
        team.name = data.name || team.name
      } else {
        console.log(`Missing teamId: ${team.name}`)
      }
    }

    if (team.id !== null) {
      // const url =  `https://rebbl.net/api/v2/team/${team.id}`
      const url = `http://localhost:4000/api/${team.id}`
      console.log(`Fetching data from ${url}`)
      const teamData = await request(url)
      await delay(100)
      const oldTeam = await Team.find({ id: team.id }).exec()
      if (oldTeam) {
        oldTeam.seasons.push(season)
        await oldTeam.save()
      } else {
        const roster = teamData.roster.map(player => ({
          id: player.id,
          name: player.name,
        }))
        const newTeam = new Team({
          id: team.id,
          name: team.name,
          league: team.league,
          seasons: [season],
          roster,
        })
        await newTeam.save()
      }
    }
  }, { concurrency: 1 })
  mongoose.connection.close()
})()
