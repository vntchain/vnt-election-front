import React from 'react'
import { Consumer } from './context'

export default function injectIntl(Component) {
  return function WrappedComponent(props) {
    return <Consumer>{value => <Component {...props} intl={value} />}</Consumer>
  }
}
