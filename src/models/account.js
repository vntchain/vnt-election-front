import { effects } from 'redux-sirius'

const { put } = effects

export default {
  state: {
    accountAddr: null,
    proxyAddr: null,
    balance: null, // 余额
    stake: null, // 抵押
    myVotes: null, //根据自己的账户查询的投票信息
    proxiedVotes: null //根据设置的代理地址查询的投票信息
  },
  reducers: {
    setLoadingStatus: (state, { payload }) => {
      const { field, ...data } = payload
      return {
        ...state,
        [field]: { ...state[field], ...data }
      }
    },
    setState: (state, { payload }) => {
      const { field, ...data } = payload
      return {
        ...state,
        [field]: data
      }
    }
  },
  effects: ({ takeLatest }) => ({
    getAcctAddr: takeLatest(function*() {
      const getAcct = new Promise(resolve => {
        window.vnt.core.getCoinbase((err, coinbase) =>
          resolve({ err, coinbase })
        )
      })

      try {
        const res = yield getAcct
        yield put({
          type: 'account/setAccountAddr',
          payload: {
            err: res.err ? res.err : null,
            addr: res.coinbase
          }
        })
      } catch (e) {
        throw new Error(e)
      }
    })
  })
}
