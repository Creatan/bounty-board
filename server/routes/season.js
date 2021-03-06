import express from 'express'
import Season from '../models/season'

const router = express.Router()

function transformSeasonData(season) {
  const leagues = season.leagues.map(league => ({
    value: league.name,
    label: league.name.split(' - ')[1],
  }))

  // TODO: hopefully we can get rid of this in the future
  const divisions = season.leagues.reduce((acc, cur) => acc.concat(cur.divisions
    .map((div) => {
      let label = ''
      if (div.indexOf('–') > -1) {
        label = div.split(' – ')[1]
      } else if (div.indexOf('-') > -1) {
        label = div.split(' - ')[1]
      } else {
        label = div.split(' ').slice(2).join(' ') // Big O is special
      }
      return { league: cur.name, value: `${div}`, label }
    })), [])
    .sort((a, b) => {
      if (a.label > b.label) return 1
      if (a.label < b.label) return -1
      return 0
    })
  return { leagues, divisions }
}


async function getSeason(req, res) {
  const season = await Season.findOne({ active: true }).exec()
  res.json({ identifier: season.identifier, ...transformSeasonData(season) })
}
router.get('/', getSeason)

export default router
