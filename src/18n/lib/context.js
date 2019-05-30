import React from 'react'

const { Provider, Consumer } = React.createContext({
  locale: '',
  messages: {}
})

export { Provider, Consumer }

export default Consumer
