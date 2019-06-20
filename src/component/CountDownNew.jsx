import React from 'react'
import PropTypes from 'prop-types'
import { formatTime } from 'utils/tools'

import styles from './Common.scss'

class CountDownNew extends React.Component {
  constructor(props) {
    super(props)
    this.timerId = null
    this.state = {
      curTime: Math.floor(
        (this.props.totalCountDownTime + this.props.time - Date.now()) / 1000
      ) // 取整为s
    }
  }

  get curTime() {
    const formatStyle = this.props.totalCountDownTime > 60000 ? 'HH:mm:ss' : 's'
    return formatTime(this.state.curTime, formatStyle)
  }

  startTimer = () => {
    // if (this.timerId) {
    //   return
    // }
    // console.log('____zzzz: ',this.state.curTime) //eslint-disable-line
    let initTime = this.state.curTime
    this.timerId = setInterval(() => {
      // console.log('____YYYY: ',this.state.curTime,initTime) //eslint-disable-line
      this.setState({ curTime: initTime - 1 })
      initTime = initTime - 1
      if (initTime < 0) {
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
      //console.log(prevProps,this.props,this.timerId) //eslint-disable-line
      clearInterval(this.timerId)
      //console.log('____ID: ',this.timerId) //eslint-disable-line
      const deltaT =
        this.props.totalCountDownTime + this.props.time - Date.now()
      this.setState(
        {
          curTime: Math.floor(deltaT / 1000)
        },
        () => {
          // console.log('____XXXX: ',this.state.curTime) //eslint-disable-line
          this.startTimer()
        }
      )
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
