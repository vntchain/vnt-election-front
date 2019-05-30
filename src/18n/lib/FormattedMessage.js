import React from 'react'
import PropTypes from 'prop-types'
import { Consumer } from './context'

function FormattedMessage(props) {
  const { id, plain } = props
  return (
    <Consumer>
      {value => {
        return plain ? value.messages[id] : <span>{value.messages[id]}</span>
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
