import React from 'react'
import PropTypes from 'prop-types'
import { formatTime } from 'utils/tools'

import styles from './Common.scss'

class CountDownNew extends React.Component {
  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      curTime: this.props.totalCountDownTime + this.props.time - Date.now() // 倒计时时长+开始倒计时的时间
    }
  }

  get curTime() {
    const formatStyle = this.props.totalCountDownTime > 60000 ? 'HH:mm:ss' : 's'
    return formatTime(this.state.curTime, formatStyle)
  }

  startTimer = () => {
    if (this.timerId) return
    this.timerId = setInterval(() => {
      this.setState({ curTime: this.state.curTime - 1000 })
      if (this.state.curTime < 1000) {
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
      console.log(prevProps,this.props,this.timerId) //eslint-disable-line
      this.setState({
        curTime: this.props.totalCountDownTime + this.props.time - Date.now()
      })
    }
  }

  componentWillUnmount() {
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
