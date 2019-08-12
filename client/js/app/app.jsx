import React from 'react'
import BountyBoard from './bounty-board'
import BountyModal from './bounty-modal'
import {
  getBounties, getSeason, getTeams, createBounty, getUser,
} from '../actions'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bounties: [],
      filter: {
        leagues: [],
        status: ['claimable', 'open'],
      },
      modal: '',
      season: {},
      user: undefined,
      teams: [],
    }

    this.getTeams = this.getTeams.bind(this)
    this.createBounty = this.createBounty.bind(this)
    this.authenticate = this.authenticate.bind(this)
  }

  async componentDidMount() {
    const [bounties, season, user] = await Promise.all([getBounties(), getSeason(), getUser()])
    console.log(user)
    this.setState({
      bounties: bounties.sort((a, b) => -a.league.localeCompare(b.league)),
      season,
      user: Object.keys(user).length === 0 ? undefined : user, // TODO: some other way to handle this
    })
  }

  setStatusFilter(status) {
    this.setState((prevState) => {
      const { filter } = prevState
      const statusFilter = [status]
      if (status === 'open') {
        statusFilter.push('claimable')
      }
      filter.status = statusFilter
      return { filter }
    })
  }

  setLeagueFilter(league) {
    this.setState((prevState) => {
      const { filter } = prevState
      const { leagues } = filter
      const index = leagues.indexOf(league)
      if (index > -1) {
        leagues.splice(index, 1)
      } else {
        leagues.push(league)
      }
      filter.leagues = leagues
      return { filter }
    })
  }

  async getTeams(league) {
    const { season: { identifier } } = this.state
    const teams = await getTeams(league, identifier)
    this.setState({ teams })
  }

  async createBounty(bounty) {
    const response = await createBounty(bounty)
    if (response.status === 200) {
      const savedBounty = await response.json()
      this.setState((prevState) => {
        const { bounties } = prevState
        return { bounties: [...bounties, savedBounty].sort((a, b) => -a.league.localeCompare(b.league)) }
      })
    } else {
      const error = await response.json()
      throw new Error(error.message)
    }
  }

  openModal(modal) {
    this.setState({ modal })
  }

  async authenticate() {
    const response = await fetch('/auth/reddit')
    if (response.ok) {
      const user = await response.json()
      console.log(user)
      this.setState({ user })
    }
  }

  render() {
    const {
      bounties, season, filter, modal, teams, user,
    } = this.state
    console.log(user)
    return (
      <div className="container">
        <header>
          <a className="logo" href="/">Rebbl</a>
          <h1>Bounty Board</h1>
        </header>
        <main>
          <div className="nav">
            <div className={`controls${user ? ' logged' : ''}`}>
              <div className="label">
                  Show:
              </div>
              <div className="menu">
                <button
                  onClick={() => this.setStatusFilter('open')}
                  type="button"
                  className={`btn${filter.status.includes('open') ? ' active' : ''}`}
                >
                  Wanted
                </button>
                <button
                  onClick={() => this.setStatusFilter('claimed')}
                  type="button"
                  className={`btn${filter.status.includes('claimed') ? ' active' : ''}`}
                >
                  Claimed
                </button>
              </div>
              <div className="label">
                  Filter:
              </div>
              <div className="filter">
                <button
                  onClick={() => this.setLeagueFilter('REBBL - REL')}
                  type="button"
                  className={`btn${filter.leagues.includes('REBBL - REL') ? ' active' : ''}`}
                >
                  REL
                </button>

                <button
                  onClick={() => this.setLeagueFilter('REBBL - GMan')}
                  type="button"
                  className={`btn${filter.leagues.includes('REBBL - GMan') ? ' active' : ''}`}
                >
                  GMan
                </button>
                <button
                  onClick={() => this.setLeagueFilter('REBBL - Big O')}
                  type="button"
                  className={`btn${filter.leagues.includes('REBBL - Big O') ? ' active' : ''}`}
                >
                  Big O
                </button>
              </div>
            </div>
            {
              !user && (
              <div className="login">
                <a href="/auth/reddit" className="btn">
                  Log in to place or claim a bounty
                </a>
              </div>
              )
            }
            {user && (
              <div className="add">
                <button type="button" className="btn" onClick={() => this.openModal('createBounty')}>
                  Add bounty
                </button>
              </div>
            )}
          </div>
          <BountyBoard
            bounties={bounties.filter(bounty => filter.leagues.length === 0 || filter.leagues.includes(bounty.league))
              .filter(bounty => filter.status.includes(bounty.status))}
            user={user}
            deleteBounty={() => console.log('---DELETED---')}
          />
        </main>
        <footer>
          &copy; Creatan
          {' '}
          {new Date().getFullYear() }
          {' '}
            |
          {' '}
          <a href="https://github.com/Creatan/bounty-board">Github</a>
        </footer>
        {modal === 'createBounty' && (
          <BountyModal
            season={season}
            teams={teams}
            getTeams={this.getTeams}
            onCancel={() => this.openModal('')}
            createBounty={this.createBounty}
          />
        )}
      </div>
    )
  }
}

export default App
