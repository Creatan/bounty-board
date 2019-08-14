import express from 'express'
import Bounty from '../models/bounty'
import Team from '../models/team'
import Season from '../models/season'
import { authenticated, HttpError } from '../utils'

const router = express.Router()

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
function isValid(bounty) {
  const validationErrors = []
  Object.entries(bounty).forEach(([key, value]) => {
    if (!value) {
      validationErrors.push(`${capitalize(key)} is required`)
    }
  })

  return validationErrors
}

async function listBounties(req, res) {
  const bounties = await Bounty.find().sort({ league: 1, 'team.name': 1 }).exec()
  res.json(bounties)
}

async function createBounty(req, res, next) {
  const {
    league,
    division,
    team,
    player,
    requirement,
    reason,
    prize,
  } = req.body

  // TODO: Request validation
  const validationErrors = isValid({
    league, division, team, player, requirement, reason, prize,
  })
  if (validationErrors.length > 0) {
    next(new HttpError(400, validationErrors.join(',')))
  } else {
    const teamData = await Team.findOne({ id: team }).exec()
    const season = await Season.findOne({ active: true }).exec()
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
      requirement,
      reason,
      prize,
      status: 'open',
      provider: req.user._id,
      season: season.identifier,
    })
    res.json(await bounty.save())
  }
}

async function deleteBounty(req, res, next) {
  try {
    const bounty = await Bounty.findOne({ _id: req.params.id }).exec()
    if (!bounty) throw new HttpError(404, 'Bounty not found')
    if (req.user._id.toString() !== bounty.provider.id.toString()) throw new HttpError(403, 'Permission denied')
    res.json({})
  } catch (err) {
    next(err)
  }
}


router.get('/', listBounties)
router.post('/', authenticated, createBounty)
router.delete('/:id', authenticated, deleteBounty)

export default router
