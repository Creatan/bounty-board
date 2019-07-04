import express from 'express'
import Team from '../models/team'

const router = express.Router()


async function getTeams(req, res) {
  const { division, league, season } = req.query

  const teams = await Team.find({ division, league, seasons: { $in: [season] } }).exec()
  res.json(teams)
}

router.get('/', getTeams)

export default router
