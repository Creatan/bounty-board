/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'


const ControlsModal = (props) => {
  const {
    markAsClaimed, deleteBounty, onClose, showClaim, showDelete,
  } = props

  return (
    <Fragment>
      <div className="modal manage">
        <div className="modal-header">Manage Bounty</div>
        <div className="modal-body">
          <div className="modal-row">
            {showClaim && (<button type="button" onClick={markAsClaimed}>Mark claimed</button>)}
            {showDelete && (<button type="button" onClick={deleteBounty}>Delete bounty</button>)}
          </div>
        </div>
      </div>
      <div className="modal-overlay" onClick={onClose} />
    </Fragment>
  )
}


ControlsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  markAsClaimed: PropTypes.func.isRequired,
  deleteBounty: PropTypes.func.isRequired,
  showClaim: PropTypes.bool.isRequired,
  showDelete: PropTypes.bool.isRequired,
}

export default ControlsModal
