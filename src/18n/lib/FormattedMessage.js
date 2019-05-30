import React from 'react'
import PropTypes from 'prop-types'
import { Consumer } from './context'

function FormattedMessage(props) {
  const { id, label } = props
  return (
    <Consumer>
      {value => {
        return label ? <span>{value.messages[id]}</span> : value.messages[id]
      }}
    </Consumer>
  )
}

FormattedMessage.propTypes = {
  id: PropTypes.string.isRequired,
  plain: PropTypes.bool
}

FormattedMessage.defaultProps = {
  plain: false
}
export default FormattedMessage
