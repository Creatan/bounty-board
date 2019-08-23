import React from 'react'
import BountyBoard from './bounty-board'
import BountyModal from './bounty-modal'
import DetailsModal from './details-modal'
import ControlsModal from './controls-modal'
import {
  getBounties, getSeason, getTeams, createBounty, getUser, deleteBounty, markBounty, searchTeams,
} from '../actions'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      bounties: [],
      filter: {
        leagues: [],
        status: ['claimable', 'open'],
      },
      modal: '',
      season: {},
      user: undefined,
      details: {},
      teams: [],
      bountyId: '',
      player: '',
    }

    this.getTeams = this.getTeams.bind(this)
    this.createBounty = this.createBounty.bind(this)
    this.authenticate = this.authenticate.bind(this)
    this.markAsClaimed = this.markAsClaimed.bind(this)
    this.deleteBounty = this.deleteBounty.bind(this)
    this.closeControls = this.closeControls.bind(this)
    this.closeDetails = this.closeDetails.bind(this)
    this.closeBountyModal = this.closeBountyModal.bind(this)
  }

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const [bounties, season, user] = await Promise.all([getBounties(), getSeason(), getUser()])
    let teams = []
    const player = params.get('player')
    if (player) {
      teams = await searchTeams({ player })
    }
    const newState = {
      bounties: bounties.sort((a, b) => -a.league.localeCompare(b.league)),
      teams,
      season,
      user: Object.keys(user).length === 0 ? undefined : user, // TODO: some other way to handle this
      loading: false,
      player: player || '',
    }
    if (params.get('player')) newState.modal = 'createBounty'

    this.setState(newState)
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
        return { bounties: [...bounties, savedBounty].sort((a, b) => -a.league.localeCompare(b.league)), player: '' }
      })
    } else {
      const error = await response.json()
      throw new Error(error.message)
    }
  }

  openModal(modal) {
    this.setState({ modal })
  }

  showDetails(provider) {
    this.setState({
      modal: 'info',
      details: provider,
    })
  }

  showControls(id) {
    this.setState({
      modal: 'controls',
      bountyId: id,
    })
  }

  async markAsClaimed() {
    const { bountyId, player } = this.state
    const response = await markBounty(bountyId)
    if (response.status === 200) {
      const bounty = await response.json()
      if (player) window.history.replaceState(null, null, window.location.pathname)

      this.setState((prevState) => {
        const { bounties } = prevState
        const oldBountyIndex = bounties.findIndex(b => b._id.toString() === bounty._id.toString())
        if (oldBountyIndex > -1) {
          bounties.splice(oldBountyIndex, 1)
        }
        return {
          bounties: [...bounties, bounty].sort((a, b) => -a.league.localeCompare(b.league)),
          modal: '',
          bountyId: '',
        }
      })
    }
  }

  async deleteBounty() {
    const { bountyId } = this.state
    const response = await deleteBounty(bountyId)
    if (response.status === 200) {
      this.setState((prevState) => {
        const { bounties } = prevState
        const oldBountyIndex = bounties.findIndex(b => b._id.toString() === bountyId)
        if (oldBountyIndex > -1) {
          bounties.splice(oldBountyIndex, 1)
        }
        return {
          bounties: [...bounties],
          modal: '',
          bountyId: '',
        }
      })
    }
  }

  closeControls() {
    this.setState({
      modal: '',
      bountyId: '',
    })
  }

  closeDetails() {
    this.setState({
      modal: '',
      details: '',
    })
  }

  closeBountyModal() {
    window.history.replaceState(null, null, window.location.pathname)
    this.setState({ modal: '', player: '' })
  }

  async authenticate() {
    const response = await fetch('/auth/reddit')
    if (response.ok) {
      const user = await response.json()
      this.setState({ user })
    }
  }

  render() {
    const {
      bounties, season, filter, modal, teams, user, details, bountyId, loading, player,
    } = this.state
    const bounty = bountyId ? bounties.find(b => b._id.toString() === bountyId) : {}
    return !loading && (
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
            bounties={bounties.filter(b => filter.leagues.length === 0 || filter.leagues.includes(b.league))
              .filter(b => filter.status.includes(b.status))}
            user={user}
            showDetails={provider => this.showDetails(provider)}
            showControls={id => this.showControls(id)}
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
            onCancel={this.closeBountyModal}
            createBounty={this.createBounty}
            player={player}
          />
        )}
        {modal === 'info' && (
          <DetailsModal provider={details} onClose={this.closeDetails} />
        )}

        {modal === 'controls' && (
          <ControlsModal
            markAsClaimed={this.markAsClaimed}
            deleteBounty={this.deleteBounty}
            onClose={this.closeControls}
            showClaim={bounty.status === 'claimable'}
            showDelete={bounty.status !== 'claimable'}
          />
        )}
      </div>
    )
  }
}

export default App
