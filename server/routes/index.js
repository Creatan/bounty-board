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

function sortBounties(a, b) {
  const sortByLeague = a.displayLeague.localeCompare(b.displayLeague)
  if (sortByLeague !== 0) {
    return sortByLeague
  }
  const sortByTeamName = a.team.name.localeCompare(b.team.name)
  if (sortByTeamName !== 0) {
    return sortByTeamName
  }
  return a.player.name.localeCompare(b.player.name)
}

async function listBounties(req, res) {
  const bounties = await Bounty.find({ deleted: false }).populate('provider', 'redditName discord -_id').exec()
  const transformedBounties = bounties.map(bounty => ({
    ...bounty.toObject(),
    displayLeague: `${bounty.league.split(' - ')[1]} ${bounty.division.split(' ').pop()}`,
  }))
  const claimableBounties = transformedBounties.filter(bounty => bounty.status === 'claimable')
  const rest = transformedBounties.filter(bounty => bounty.status !== 'claimable')
  claimableBounties.sort(sortBounties)
  rest.sort(sortBounties)

  res.json(claimableBounties.concat(rest))
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
      division,
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
    const newBounty = await bounty.save()
    res.json(await newBounty.populate('provider', 'redditName discord -_id').execPopulate())
  }
}

async function deleteBounty(req, res, next) {
  try {
    const bounty = await Bounty.findOne({ _id: req.params.id }).exec()
    if (!bounty) throw new HttpError(404, 'Bounty not found')
    if (req.user._id.toString() !== bounty.provider.toString()) throw new HttpError(403, 'Permission denied')
    bounty.deleted = true
    await bounty.save()
    res.json(bounty)
  } catch (err) {
    next(err)
  }
}

async function markBounty(req, res, next) {
  try {
    const bounty = await Bounty.findOne({ _id: req.params.id }).exec()
    if (!bounty) throw new HttpError(404, 'Bounty not found')
    if (req.user._id.toString() !== bounty.provider.toString()) throw new HttpError(403, 'Permission denied')
    bounty.status = req.body.status
    await bounty.save()
    res.json(bounty)
  } catch (err) {
    next(err)
  }
}

router.get('/', listBounties)
router.post('/', authenticated, createBounty)
router.delete('/:id', authenticated, deleteBounty)
router.patch('/:id', authenticated, markBounty)

export default router
