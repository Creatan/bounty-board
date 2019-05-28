/* eslint-env browser */

function filterRows(state) {
  const claimed = state.show === 'claimed'
  document.querySelectorAll('tbody tr').forEach((element) => { element.classList.remove('hidden') })

  document.querySelectorAll(`tbody tr[data-claimed="${!claimed}"]`).forEach((element) => {
    element.classList.add('hidden')
  })

  if (state.filter !== '') {
    document.querySelectorAll('tbody tr:not(.hidden)').forEach((element) => {
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
  document.querySelectorAll('.menu button').forEach((element) => {
    element.addEventListener('click', (event) => {
      document.querySelector('.menu button.active').classList.remove('active')
      event.target.classList.add('active')
      state.show = event.target.dataset.show
      filterRows(state)
    })
  })

  document.querySelectorAll('.filter button').forEach((element) => {
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
