import React from 'react'
import PropTypes from 'prop-types'


const BountyBoard = (props) => {
  const { bounties, user, deleteBounty } = props
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th width="7%">League</th>
            <th width="15%">Player</th>
            <th width="15%">Team</th>
            <th width="20%">Prize</th>
            <th width="16%">Requirement</th>
            <th width="17%">Reason</th>
            <th width="10%">Provider</th>
          </tr>
        </thead>
        <tbody>
          {
            bounties.map(bounty => (
              <tr data-claimed={bounty.status} key={bounty._id}>
                <td width="7%">{ bounty.league }</td>
                <td width="15%">{ bounty.player.name }</td>
                <td width="15%">{ bounty.team.name }</td>
                <td width="20%">{ bounty.prize }</td>
                <td width="16%">
                  { bounty.requirement.length > 1
                    ? `${bounty.requirement.slice(0, -1).join(', ')} or ${bounty.requirement.slice(-1)}` : bounty.requirement[0] }
                </td>
                <td width="17%">{ bounty.reason }</td>
                <td width="10%">
                  { user._id && bounty.provider.id.toString() === user._id.toString()
                    ? <button type="button" className="delete-btn" onClick={deleteBounty(bounty._id)}>Delete</button> : bounty.provider.name }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

BountyBoard.propTypes = {
  bounties: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.string,
    league: PropTypes.string,
    reason: PropTypes.string,
    team: PropTypes.object,
    player: PropTypes.object,
    prize: PropTypes.string,
    requirement: PropTypes.array,
    provider: PropTypes.object,
  })),
  user: PropTypes.shape({
    _id: PropTypes.string,
    redditId: PropTypes.string,
    name: PropTypes.string,
  }),
  deleteBounty: PropTypes.func.isRequired,
}

BountyBoard.defaultProps = {
  bounties: [],
  user: {},
}

export default BountyBoard
