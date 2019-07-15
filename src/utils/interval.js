export class intervalManagerApp {
  constructor() {
    this.intervals = {
      test: {
        id: null,
        originTime: 0
      }
    }
  }

  newInterval(key, deadline, updateDataFn) {
    if (this.intervals[key] && this.intervals[key].id) {
      window.clearInterval(this.intervals[key].id)
    }

    this.intervals[key] = {
      id: null,
      originTime: deadline
    }
    this.intervals[key].id = setInterval(() => {
      this.intervals[key].originTime -= 1
      // 此处只能小于0，需要多减一秒，保证redux中的数据到达组件时，组件计算出来的时间满足到了一天
      if (this.intervals[key].originTime < 0) {
        this.intervals[key].originTime = 0
        window.clearInterval(this.intervals[key].id)
        this.intervals[key].id = null
      }
      if (updateDataFn && typeof updateDataFn === 'function') {
        updateDataFn(
          key,
          this.intervals[key].id,
          this.intervals[key].originTime
        )
      }
    }, 1000)
    if (updateDataFn && typeof updateDataFn === 'function') {
      updateDataFn(key, this.intervals[key].id, this.intervals[key].originTime)
    }
  }

  clearInterval(key, updateDataFn) {
    if (!this.intervals[key]) return
    window.clearInterval(this.intervals[key].id)
    this.intervals[key].id = null
    if (updateDataFn && typeof updateDataFn === 'function') {
      updateDataFn(key, null, 0)
    }
  }

  clearIntervalAll(keys, updateDataFn) {
    if (!Array.isArray(keys)) {
      console.error('keys is not array') // eslint-disable-line
    }
    keys.map(k => {
      if (!this.intervals[k]) return
      window.clearInterval(this.intervals[k].id)
      this.intervals[k].id = null
      if (updateDataFn && typeof updateDataFn === 'function') {
        updateDataFn(k, null, 0)
      }
    })
  }
}
