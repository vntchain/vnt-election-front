import React from 'react'
import PropTypes from 'prop-types'
import { formatTime } from 'utils/tools'

import styles from './Common.scss'

class CountDownNew extends React.Component {
  constructor(props) {
    super(props)
    this.timerId = null
    this.originLeftTime = Math.floor(
      (this.props.totalCountDownTime + this.props.time - Date.now()) / 1000
    )
    this.state = {
      curTime: this.originLeftTime
    }
  }

  get curTime() {
    const formatStyle = this.props.totalCountDownTime > 60000 ? 'HH:mm:ss' : 's'
    return formatTime(this.state.curTime, formatStyle)
  }

  startTimer = () => {
    this.timerId = setInterval(() => {
      this.originLeftTime = this.originLeftTime - 1
      this.setState({ curTime: this.originLeftTime })
      if (this.originLeftTime < 0) {
        this.originLeftTime = 0
        this.setState({ curTime: 0 })
        this.props.onFinish()
        clearInterval(this.timerId)
        this.timerId = null
      }
    }, 1000)
  }

  componentDidMount() {
    this.startTimer()
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.time !== this.props.time ||
      prevProps.totalCountDownTime !== this.props.totalCountDownTime
    ) {
      this.originLeftTime = Math.floor(
        (this.props.totalCountDownTime + this.props.time - Date.now()) / 1000
      )
      this.setState({ curTime: this.originLeftTime })
    }
  }

  async componentWillUnmount() {
    clearInterval(this.timerId)
    this.timerId = null
  }

  render() {
    return <div className={styles.countDownNew}>{this.curTime}</div>
  }
}

export default CountDownNew

CountDownNew.propTypes = {
  time: PropTypes.number.isRequired,
  onFinish: PropTypes.func.isRequired,
  totalCountDownTime: PropTypes.number.isRequired
}
