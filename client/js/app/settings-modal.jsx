/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'


class SettingsModal extends React.Component {
  constructor(props) {
    super(props)
    const { user: { discord } } = props
    this.state = {
      discord,
    }
    this.onChange = this.onChange.bind(this)
    this.onSave = this.onSave.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }


  componentDidMount() {
    window.addEventListener('keyup', this.handleKeyPress)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeyPress)
  }

  onChange(event) {
    this.setState({ discord: event.target.value })
  }

  onSave() {
    const { saveDetails, onClose } = this.props
    const { discord } = this.state
    saveDetails(discord)
    onClose()
  }

  handleKeyPress(event) {
    if (event.keyCode === 27) {
      const { onClose } = this.props
      event.preventDefault()
      onClose()
    }
  }

  render() {
    const { user, onClose } = this.props
    const { discord } = this.state
    return (
      <Fragment>
        <div className="modal">
          <div className="modal-header">Contact details</div>
          <div className="modal-body">
            <div className="modal-row">
              <h3>Reddit</h3>
              {`/u/${user.redditName}`}
            </div>
            <div className="modal-row">
              <label htmlFor="discord">
                Discord
                <input name="discord" value={discord} onChange={this.onChange} type="text" />

              </label>
            </div>
          </div>
          <div className="modal-footer">
            <div className="modal-row">
              <button type="button" onClick={this.onSave}>Save</button>
              <button type="button" className="cancel" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
        <div className="modal-overlay" onClick={onClose} />
      </Fragment>
    )
  }
}


SettingsModal.propTypes = {
  user: PropTypes.shape({
    redditName: PropTypes.string,
    discord: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  saveDetails: PropTypes.func.isRequired,
}

export default SettingsModal
