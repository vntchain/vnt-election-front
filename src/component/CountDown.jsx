import React from 'react'
import PropTypes from 'prop-types'
import { Statistic } from 'antd'

import styles from './Common.scss'

function CountDown(props) {
  const { time, onFinish } = props
  const deadline = 86400000 + time
  return (
    <Statistic.Countdown
      value={deadline}
      onFinish={onFinish}
      className={styles.countDown}
    />
  )
}

export default CountDown

CountDown.propTypes = {
  time: PropTypes.number.isRequired,
  onFinish: PropTypes.func.isRequired
}
