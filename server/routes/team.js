import express from 'express'
import Team from '../models/team'

const router = express.Router()


async function getTeams(req, res) {
  const {
    division, league, season, player,
  } = req.query
  const query = {}
  if (division) query.division = division
  if (league) query.league = league
  if (season) query.seasons = season
  if (player) query['roster.id'] = +player
  console.log(query)
  const teams = await Team.find(query).exec()
  console.log(teams)
  res.json(teams)
}

router.get('/', getTeams)

export default router
