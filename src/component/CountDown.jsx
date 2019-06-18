import React from 'react'
import PropTypes from 'prop-types'
import { Statistic } from 'antd'

import styles from './Common.scss'

function CountDown(props) {
  const { time, onFinish, totalCountDownTime } = props
  const deadline = totalCountDownTime + time
  const format = totalCountDownTime > 60000 ? 'HH:mm:ss' : 's'

  return (
    <Statistic.Countdown
      value={deadline}
      onFinish={onFinish}
      className={styles.countDown}
      format={format}
    />
  )
}

export default CountDown

CountDown.propTypes = {
  time: PropTypes.number.isRequired,
  onFinish: PropTypes.func.isRequired,
  totalCountDownTime: PropTypes.number.isRequired
}
