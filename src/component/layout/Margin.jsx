import React from 'react'
import PropTypes from 'prop-types'
import styles from './Margin.scss'

export default function Margin(props) {
  let gapSize = props.size || 'medium'
  return <div className={styles[gapSize]} />
}

Margin.propTypes = {
  size: PropTypes.string
}
