import express from 'express'
import Bounty from '../models/bounty'
import Season from '../models/season'
import Team from '../models/team'
import { authenticated } from '../utils'

const router = express.Router()


async function listBounties(req, res) {
  const bounties = await Bounty.find().sort({ league: 1, 'team.name': 1 }).exec()
  const season = await Season.findOne({ identifier: 'season 11' }).exec()
  const leagues = season.leagues.map(league => ({
    value: league.name,
    label: league.name.split(' - ')[1],
  }))
  const divisions = season.leagues.reduce((acc, cur) => acc.concat(cur.divisions
    .map(div => ({ value: `${cur.name}:${div}`, label: div.split(' - ')[1] }))), [])
    .sort((a, b) => {
      if (a.label > b.label) return 1
      if (a.label < b.label) return -1
      return 0
    })
  res.render('index', { bounties, season: { leagues, divisions, identifier: 'season 11' }, user: req.user })
}

async function createBounty(req, res) {
  const {
    league,
    division,
    team,
    player,
    requirements,
    reason,
    prize,
  } = req.body

  // TODO: Request validation

  const teamData = await Team.findOne({ id: team }).exec()
  const playerData = teamData.roster.find(p => p.id === parseInt(player, 10))
  const bounty = new Bounty({
    league,
    division: division.split(':')[1],
    team: {
      id: teamData.id,
      name: teamData.name,
    },
    player: {
      id: playerData.id,
      name: playerData.name,
    },
    requirements,
    reason,
    prize,
    status: 'open',
    provider: {
      id: req.user._id,
      name: req.user.redditName,
    },
    season: 'season 11',
  })
  await bounty.save()
  res.redirect('/')
}

router.get('/', listBounties)
router.post('/bounty', authenticated, createBounty)

export default router
