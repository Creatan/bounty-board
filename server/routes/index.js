import express from 'express'
import Bounty from '../models/bounty'

const router = express.Router()


async function listBounties(req, res) {
  const bounties = await Bounty.find().sort({ league: 1, 'team.name': 1 }).exec()
  res.render('index', { bounties })
}

router.use('/', listBounties)

export default router
