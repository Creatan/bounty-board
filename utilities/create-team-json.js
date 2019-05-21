const cheerio = require('cheerio')
const fs = require('fs')
const $ = cheerio.load(fs.readFileSync('./utilities/signups.html'))

const teamList = $('.TeamLabel-info').eq(2).find('.TableRow')
const teams = teamList.get().map(function(element) {
  const info = $(element).find('div')
  const team = $(info[1]).find('a')
  const teamURL = team.attr('href')
  const teamId = teamURL ? teamURL.split('/').slice(-1)[0]: null
  const teamName = team.find('span').text().trim()
  const league = $(info[4]).text().trim()
  return {
    id: teamId,
    name: teamName,
    league: league
  }
})

fs.writeFileSync('./teams.json', JSON.stringify(teams))


