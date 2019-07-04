/* eslint-env browser */
/* globals season */
const $ = sel => document.querySelectorAll(sel)

function filterRows(state) {
  const claimed = state.show === 'claimed'
  $('tbody tr').forEach((element) => { element.classList.remove('hidden') })

  $(`tbody tr[data-claimed="${!claimed}"]`).forEach((element) => {
    element.classList.add('hidden')
  })

  if (state.filter !== '') {
    $('tbody tr:not(.hidden)').forEach((element) => {
      if (!element.children.item(0).textContent.toLowerCase().includes(state.filter)) {
        element.classList.add('hidden')
      }
    })
  }
}
async function getTeams(season, league, division) {
  const response = await fetch(`/api/v1/teams?league=${league}&division=${division}&season=${season}`)
  return response.json()
}
function addEmptyOption(selectElement) {
  const option = document.createElement('option')
  option.value = ''
  option.text = ''
  selectElement.appendChild(option)
}
function setTeamOptions(teams, selectElement) {
  while (selectElement.firstChild) selectElement.removeChild(selectElement.firstChild)
  addEmptyOption(selectElement)
  teams.forEach((team) => {
    const option = document.createElement('option')
    option.value = team.id
    option.text = team.name
    selectElement.appendChild(option)
  })
}

function setPlayerOptions(players, selectElement) {
  while (selectElement.firstChild) selectElement.removeChild(selectElement.firstChild)
  addEmptyOption(selectElement)
  players.forEach((player) => {
    const option = document.createElement('option')
    option.value = player.id
    option.text = player.name
    selectElement.appendChild(option)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    display: {
      show: 'wanted',
      filter: '',
    },
    data: {
      teams: {},
    },
  }

  const modal = document.querySelector('.modal')
  const modalOverlay = document.querySelector('.modal-overlay')
  const teamSelect = document.querySelector('select[name="team"]')
  const leagueSelect = document.querySelector('select[name="league"]')
  const playerSelect = document.querySelector('select[name="player"]')
  const divisionSelect = document.querySelector('select[name="division"]')

  $('.menu button').forEach((element) => {
    element.addEventListener('click', (event) => {
      document.querySelector('.menu button.active').classList.remove('active')
      event.target.classList.add('active')
      state.display.show = event.target.dataset.show
      filterRows(state.display)
    })
  })

  $('.filter button').forEach((element) => {
    element.addEventListener('click', (event) => {
      const prev = document.querySelector('.filter button.active')
      if (prev) {
        prev.classList.remove('active')
      }

      if (event.target.dataset.filter === state.display.filter) {
        state.display.filter = ''
      } else {
        state.display.filter = event.target.dataset.filter
        event.target.classList.add('active')
      }
      filterRows(state.display)
    })
  })
  const addBtn = document.querySelector('.add button')
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      modal.classList.toggle('closed')
      modalOverlay.classList.toggle('closed')
    })
  }
  document.querySelector('.modal .cancel').addEventListener('click', () => {
    modal.classList.toggle('closed')
    modalOverlay.classList.toggle('closed')
  })

  document.querySelector('select[name="league"]').addEventListener('change', (event) => {
    $('select[name="division"] option').forEach((element) => {
      document.querySelector('select[name="division"]').value = ''
      if (element.value.includes(event.target.value)) {
        element.classList.remove('hidden')
      } else {
        element.classList.add('hidden')
      }
    })
  })

  document.querySelector('select[name="division"]').addEventListener('change', (event) => {
    if (!state.data.teams[event.target.value]) {
      getTeams(season, leagueSelect.value, event.target.value.split(':')[1]).then((teams) => {
        state.data.teams[event.target.value] = teams.reduce((acc, curr) => {
          acc[curr.id] = curr
          return acc
        }, {})
        setTeamOptions(teams, teamSelect)
      })
    } else {
      setTeamOptions(state.data.teams[event.target.value], teamSelect)
    }
  })

  document.querySelector('select[name="team"').addEventListener('change', (event) => {
    setPlayerOptions(state.data.teams[divisionSelect.value][event.target.value].roster, playerSelect)
  })

  filterRows(state.display)
})
