import { effects } from 'redux-sirius'
const { put, call, select } = effects

export default {
  state: {
    detailStakeTimer: null,
    detailVoteTimer: null,
    nodeListVoteTimer: null
  },
  reducers: {
    setState: (state, { payload }) => {
      const { key, ...data } = payload
      return { ...state, [key]: data }
    },
    newInterval: (state, { payload }) => {
      const { key, curTime, callback } = payload
      if (state[key] && state[key].timerId) {
        window.clearInterval(state[key].timerId)
      }
      const newTimer = {
        timerId: null,
        time: curTime,
        callback
      }
      newTimer.timerId = setInterval(() => {
        console.log('减之后的时间1111', state[key])   //eslint-disable-line
        const oldState = { ...state[key] }
        oldState.time = oldState.time - 1
        console.log('减之后的时间', oldState.time) //eslint-disable-line
        if (oldState.time < 0) {
          oldState.time = 0
          window.clearInterval(oldState.timerId)
          oldState.timerId = null
          if (oldState.callback && typeof oldState.callback === 'function') {
            oldState.callback()
          }
          oldState.callback = null
        }
        return { ...state, [key]: oldState }
      }, 1000)
      return { ...state, [key]: newTimer }
    },
    clearInterval: (state, { payload }) => {
      const { key } = payload
      window.clearInterval(state[key].timerId)
      return { ...state, [key]: null }
    },
    clearIntervalAll: (state, { payload }) => {
      const { keys } = payload
      keys.map(key => {
        window.clearInterval(state[key].timerId)
      })
      const newState = {}
      for (let idx in keys) {
        newState[idx] = null
      }
      return { ...state, ...newState }
    }
  },
  effects: ({ takeEvery }) => ({
    newIntervalAsync: takeEvery(function*({ payload }) {
      const { key, curTime, callback } = payload
      const newTimer = {
        timerId: null,
        time: curTime,
        callback
      }
      newTimer.timerId = setInterval(function*() {
        const oldState = yield select(state => state.IntervalManager[key])
        oldState.time -= 1
        if (oldState.time < 0) {
          oldState.time = 0
          yield call(window.clearInterval, oldState.timerId)
          oldState.timerId = null
          if (oldState.callback && typeof oldState.callback === 'function') {
            yield call(oldState.callback)
          }
          oldState.callback = null
          yield put({
            type: 'intervalManager/setState',
            payload: {
              key,
              ...oldState
            }
          })
        }
      }, 1000)
      yield put({
        type: 'intervalManager/setState',
        payload: {
          key,
          ...newTimer
        }
      })
    }),
    clearIntervalAsync: takeEvery(function*({ payload }) {
      const { key } = payload
      const oldState = yield select(state => state.IntervalManager[key])
      yield call(window.clearInterval, oldState.timerId)
      for (let idx in oldState) {
        oldState[idx] = null
      }
      yield put({
        type: 'intervalManager/setState',
        payload: {
          key,
          ...oldState
        }
      })
    })
  })
}

// export class IntervalManager {
//   constructor() {
//     this.intervals = {
//       test: {
//         id: null,
//         time: null, // 1500s
//         countDown: 0,
//         callback: () => {}
//       }
//     }
//   }
//   newInterval(key, deadline, callback) {
//     this.intervals[key] = {
//       id: null,
//       time: deadline, //mutable
//       countDown: deadline, //mutable
//       callback
//     }
//     const interval = setInterval(() => {
//       if (this.intervals[key].countDown == 0) {
//         return
//       }
//       this.intervals[key].time -= 1
//       this.intervals[key].countDown -= 1
//       if (this.intervals[key].countDown < 0) {
//         callback()
//       }
//     }, 1000)
//     this.intervals[key].id = interval
//   }
//   clearInterval(key) {
//     // TODO
//     clearInterval(this.intervals[key].id)
//   }
// }
