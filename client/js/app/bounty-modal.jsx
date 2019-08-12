/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'


class BountyModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      league: '',
      division: '',
      player: '',
      team: '',
      requirement: [],
      reason: '',
      prize: '',
      errors: [],
    }
    this.onChange = this.onChange.bind(this)
    this.createBounty = this.createBounty.bind(this)
  }

  async onChange(event) {
    const { getTeams } = this.props
    const { name, value, checked } = event.target

    // Fetch teams if league changes
    if (name === 'league') {
      await getTeams(value)
      this.setState({ league: value })
    } else if (name === 'requirement') {
      if (checked) {
        this.setState((prevState) => {
          const { requirement } = prevState
          requirement.push(value)
          return { requirement }
        })
      } else {
        this.setState((prevState) => {
          const index = prevState.requirement.indexOf(value)
          if (index > -1) {
            const { requirement } = prevState
            requirement.splice(index, 1)
            return { requirement }
          }
          return {}
        })
      }
    } else {
      this.setState({ [name]: value })
    }
  }

  async createBounty() {
    const { createBounty, onCancel } = this.props
    try {
      await createBounty(this.state)
      onCancel()
    } catch (err) {
      const messages = err.message.split(',')

      this.setState({ errors: messages.map(msg => ({ key: msg.split(' ')[0], value: msg })) })
    }
  }

  render() {
    const { season: { leagues, divisions }, teams, onCancel } = this.props
    const {
      league, division, player, team, requirement, reason, prize, errors,
    } = this.state

    const { roster = [] } = teams.find(t => t.id === +team) || {}

    return (
      <Fragment>
        <div className="modal">
          <div className="modal-header">
            Add new bounty
          </div>
          <div className="modal-body">
            <div className="modal-row">
              <label htmlFor="league">
                League
                <select value={league} onChange={this.onChange} name="league" id="league">
                  <option value="" />
                  {
                    leagues && leagues.map(l => <option key={l.value} value={l.value}>{l.label}</option>)
                  }
                </select>
              </label>
            </div>
            <div className="modal-row">
              <label htmlFor="division">
                Division
                <select value={division} onChange={this.onChange} name="division" id="division">
                  <option value="" />
                  {
                    divisions && divisions.filter(div => div.league === league)
                      .map(div => <option key={div.value} value={div.value}>{div.label}</option>)
                  }
                </select>
              </label>
            </div>
            <div className="modal-row">
              <label htmlFor="team">
                Team
                <select value={team} onChange={this.onChange} name="team" id="team">
                  <option value="" />
                  {
                    teams && teams.filter(t => t.league === league && t.division === division)
                      .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                  }
                </select>
              </label>
            </div>
            <div className="modal-row">
              <label htmlFor="player">
                Player
                <select value={player} onChange={this.onChange} name="player" id="player">
                  <option value="" />
                  {
                    roster && roster.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                  }
                </select>
              </label>
            </div>
            <div className="modal-row">
              <h3>Requirement</h3>
              <div className="modal-row-content">
                <div className="modal-col">
                  <div>
                    <label htmlFor="ag">
                      <input type="checkbox" onChange={this.onChange} checked={requirement.includes('-AG')} id="ag" name="requirement" value="-AG" />
                      - AG
                    </label>
                  </div>
                  <div>
                    <label htmlFor="st">
                      <input type="checkbox" onChange={this.onChange} checked={requirement.includes('-ST')} id="st" name="requirement" value="-ST" />
                      - ST
                    </label>
                  </div>
                  <div>
                    <label htmlFor="av">
                      <input type="checkbox" onChange={this.onChange} checked={requirement.includes('-AV')} id="av" name="requirement" value="-AV" />
                      - AV
                    </label>
                  </div>
                  <div>
                    <label htmlFor="ma">
                      <input type="checkbox" onChange={this.onChange} checked={requirement.includes('-MA')} id="ma" name="requirement" value="-MA" />
                      - MA
                    </label>
                  </div>
                </div>
                <div className="modal-col">
                  <div>
                    <label htmlFor="dead">
                      <input
                        type="checkbox"
                        onChange={this.onChange}
                        checked={requirement.includes('Dead')}
                        id="dead"
                        name="requirement"
                        value="Dead"
                      />
                      Dead
                    </label>
                  </div>
                  <div>
                    <label htmlFor="retired">
                      <input
                        type="checkbox"
                        onChange={this.onChange}
                        checked={requirement.includes('Retired')}
                        id="retired"
                        name="requirement"
                        value="Retired"
                      />
                      Retired
                    </label>
                  </div>
                  <div>
                    <label htmlFor="niggle">
                      <input
                        type="checkbox"
                        onChange={this.onChange}
                        checked={requirement.includes('Niggled')}
                        id="niggle"
                        name="requirement"
                        value="Niggled"
                      />
                      Niggle
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-row">
              <label htmlFor="reason">
                Reason
                <input type="text" name="reason" id="reason" value={reason} onChange={this.onChange} />
              </label>
            </div>
            <div className="modal-row">
              <label htmlFor="prize">
                Prize
                <input type="text" name="prize" id="prize" value={prize} onChange={this.onChange} />
              </label>
            </div>
            {errors && (
              <div className="modal-row">
                <ul className="errors">
                  {errors.map(error => <li key={error.key}>{error.value}</li>)}
                </ul>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div className="modal-row">
              <button type="button" onClick={this.createBounty}>Add</button>
              <button type="button" className="cancel" onClick={onCancel}>Close</button>
            </div>
            <div className="modal-row">
              <span className="help">* All fields are required</span>
            </div>
          </div>
        </div>
        <div className="modal-overlay" onClick={onCancel} />
      </Fragment>
    )
  }
}

BountyModal.propTypes = {
  season: PropTypes.shape({
    divisions: PropTypes.array,
    leagues: PropTypes.array,
  }),
  teams: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.number,
    league: PropTypes.string,
    division: PropTypes.string,
    roster: PropTypes.array,
  })),
  getTeams: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  createBounty: PropTypes.func.isRequired,
}

BountyModal.defaultProps = {
  season: {},
  teams: [],
}

export default BountyModal
