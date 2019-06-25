import React from 'react'
import PropTypes from 'prop-types'
import { formatTime } from 'utils/tools'

import styles from './Common.scss'

function CountDownNewFormat(props) {
  return (
    <div className={styles.countDownNew}>
      {formatTime(props.time, 'HH:mm:ss')}
    </div>
  )
}

export default CountDownNewFormat

CountDownNewFormat.propTypes = {
  time: PropTypes.number.isRequired
}
