import React from 'react'
import PropTypes from 'prop-types'
import { formatTime } from 'utils/tools'

import styles from './Common.scss'

function CountDownNewTwo(props) {
  const formatStyle = props.time > 60 ? 'HH:mm:ss' : 's'
  return (
    <div className={styles.countDownNew}>
      {formatTime(props.time, formatStyle)}
    </div>
  )
}

export default CountDownNewTwo

CountDownNewTwo.propTypes = {
  time: PropTypes.number.isRequired
}
