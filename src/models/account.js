import { effects } from 'redux-sirius'
import { walletState } from 'constants/config'
import abi from 'utils/abi.json'
const { put, select } = effects

export default {
  state: {
    accountAddr: {
      err: null,
      addr: null // null '0x122369F04f32269598789998de33e3d56E2C507a'
    },
    proxyAddr: null,
    balance: null, // 余额
    stake: null, // 抵押
    myVotes: null, //根据自己的账户查询的投票信息
    proxiedVotes: null, //根据设置的代理地址查询的投票信息
    sendResult: null
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
        console.log(res) // eslint-disable-line
        if (!res.err) {
          yield put({
            type: 'account/setAccountAddr',
            payload: {
              err: res.err ? res.err : null,
              addr: res.coinbase
            }
          })
          yield put({
            type: 'auth/setAuthStatus',
            payload: walletState.authorized
          })
        } else {
          yield put({
            type: 'account/setAccountAddr',
            payload: {
              err: res.err
            }
          })
        }
      } catch (e) {
        throw new Error(e)
      }
    }),
    sendTx: takeLatest(function*({ payload }) {
      const { funcName, inputData, needInput } = payload
      const sendAddr = yield select(
        ({ account: { accountAddr } }) => accountAddr
      )
      const contract = window.vnt.core.contract(abi)
      let data
      try {
        //注意，inputData是数组，数组元素是参数
        data = needInput
          ? contract.packFunctionData(funcName, inputData)
          : contract.packFunctionData(funcName)
      } catch (e) {
        console.log(e) //eslint-disable-line
        throw new Error(e)
      }
      const options = {
        from: sendAddr.addr,
        to: '0x0000000000000000000000000000000000000009',
        data: data,
        chainId: window.vnt.version.network,
        gasPrice: 30000000000000,
        gas: 4000000,
        value: 0
      }
      const promise = new Promise(resolve => {
        window.vnt.core.sendTransaction(options, (err, res) => {
          resolve({ err, res })
        })
      })
      yield put({
        type: 'account/setSendResult',
        payload: {
          isLoading: true
        }
      })
      try {
        const resp = yield promise
        yield put({
          type: 'account/setSendResult',
          payload: {
            err: resp.err ? resp.err.message : null,
            txHash: resp.res,
            isLoading: false
          }
        })
      } catch (e) {
        yield put({
          type: 'account/setSendResult',
          payload: {
            err: e.message,
            txHash: null,
            isLoading: false
          }
        })
      }
    })
  })
}
