import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from './context'

export default function IntlProvider(props) {
  const value = {
    messages: props.messages,
    locale: props.locale
  }

  return <Provider value={value}>{props.children}</Provider>
}

IntlProvider.propTypes = {
  messages: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired
}
