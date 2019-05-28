/* eslint-env browser */
const $ = sel => document.querySelectorAll(sel)

function filterRows(state) {
  const claimed = state.show === 'claimed'
  $('tbody tr').forEach((element) => { element.classList.remove('hidden') })

  $(`tbody tr[data-claimed="${!claimed}"]`).forEach((element) => {
    element.classList.add('hidden')
  })

  if (state.filter !== '') {
    $('tbody tr:not(.hidden)').forEach((element) => {
      if (!element.children.item(1).textContent.toLowerCase().includes(state.filter)) {
        element.classList.add('hidden')
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    show: 'wanted',
    filter: '',
  }

  $('.menu button').forEach((element) => {
    element.addEventListener('click', (event) => {
      document.querySelector('.menu button.active').classList.remove('active')
      event.target.classList.add('active')
      state.show = event.target.dataset.show
      filterRows(state)
    })
  })

  $('.filter button').forEach((element) => {
    element.addEventListener('click', (event) => {
      const prev = document.querySelector('.filter button.active')
      if (prev) {
        prev.classList.remove('active')
      }

      if (event.target.dataset.filter === state.filter) {
        state.filter = ''
      } else {
        state.filter = event.target.dataset.filter
        event.target.classList.add('active')
      }
      filterRows(state)
    })
  })
  filterRows(state)
})
