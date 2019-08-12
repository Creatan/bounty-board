import express from 'express'
import Team from '../models/team'

const router = express.Router()


async function getTeams(req, res) {
  const { division, league, season } = req.query
  const query = {}
  if (division) query.division = division
  if (league) query.league = league
  if (season) query.seasons = { $in: [season] }
  const teams = await Team.find(query).exec()
  res.json(teams)
}

router.get('/', getTeams)

export default router
