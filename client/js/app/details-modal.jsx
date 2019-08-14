/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'


const ContactDetailsModal = (props) => {
  const { provider, onClose } = props
  return (
    <Fragment>
      <div className="modal">
        <div className="modal-header">Contact details</div>
        <div className="modal-body">
          <div className="modal-row">
            <h3>Reddit</h3>
            <a href={`https://reddit.com/u/${provider.redditName}`}>{`/u/${provider.redditName}`}</a>
          </div>
          {provider.discord && (
            <div className="modal-row">
              <h3>Discord</h3>
              <span>{provider.discord}</span>
            </div>
          )}
        </div>
      </div>
      <div className="modal-overlay" onClick={onClose} />
    </Fragment>
  )
}


ContactDetailsModal.propTypes = {
  provider: PropTypes.shape({
    redditName: PropTypes.string,
    discord: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
}

ContactDetailsModal.defaultProps = {
  provider: {},
}

export default ContactDetailsModal
