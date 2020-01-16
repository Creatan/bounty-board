import React from 'react'
import PropTypes from 'prop-types'


const BountyBoard = (props) => {
  const {
    bounties, user, showControls, showDetails,
  } = props
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th width="5%">League</th>
            <th width="5%">Division</th>
            <th width="15%">Player</th>
            <th width="15%">Team</th>
            <th width="20%">Prize</th>
            <th width="15%">Requirement</th>
            <th width="15%">Reason</th>
            <th width="10%">Provider</th>
          </tr>
        </thead>
        <tbody>
          {
            bounties.map((bounty) => {
              let onClick = null
              if (user.redditName === bounty.provider.redditName) {
                onClick = () => showControls(bounty._id)
              } else if (bounty.status === 'claimable') {
                onClick = () => showDetails(bounty.provider)
              }
              const manage = bounty.provider.redditName === user.redditName ? 'yes' : 'no'
              return (
                <tr data-status={bounty.status} data-manage={manage} key={bounty._id} onClick={onClick}>
                  <td width="5%">{ bounty.league }</td>
                  <td width="5%">{ bounty.division }</td>
                  <td width="15%">{ bounty.player.name }</td>
                  <td width="15%">{ bounty.team.name }</td>
                  <td width="20%">{ bounty.prize }</td>
                  <td width="15%">
                    { bounty.requirement.length > 1
                      ? `${bounty.requirement.slice(0, -1).join(', ')} or ${bounty.requirement.slice(-1)}` : bounty.requirement[0] }
                  </td>
                  <td width="15%">{ bounty.reason }</td>
                  <td width="10%">
                    { bounty.provider.redditName }
                  </td>
                </tr>
              )
            })
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
    redditId: PropTypes.string,
    redditName: PropTypes.string,
  }),
  showControls: PropTypes.func.isRequired,
  showDetails: PropTypes.func.isRequired,
}

BountyBoard.defaultProps = {
  bounties: [],
  user: {},
}

export default BountyBoard
