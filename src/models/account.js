import { effects } from 'redux-sirius'
import abi from 'utils/abi.json'
import { txSteps } from 'constants/config'
const { put, select } = effects
/** 
 * {
      err: null,
      addr: null // null '0x122369F04f32269598789998de33e3d56E2C507a'
    }
*/
export default {
  state: {
    accountAddr: null,
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
    },
    clearState: state => {
      // 需要获取一个对象中所有的键
      const newState = state
      for (let key in newState) {
        newState[key] = null
      }
      return { ...newState }
    }
  },
  effects: ({ takeLatest }) => ({
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
        throw new Error(e)
      }
      let gasPrice, gas
      try {
        let gasPriceResponse, gasResponse
        // 估算油价
        const gasPricePromise = new Promise(resolve => {
          window.vnt.core.getGasPrice((err, res) => {
            resolve({ err, res })
          })
        })
        // 估算耗油量
        const gasPromise = new Promise(resolve => {
          window.vnt.core.estimateGas(
            {
              from: sendAddr.addr,
              to: '0x0000000000000000000000000000000000000009',
              data: data
            },
            (err, res) => {
              resolve({ err, res })
            }
          )
        })
        gasPriceResponse = yield gasPricePromise
        gasResponse = yield gasPromise
        //console.log('估算燃气1111...',gasPriceResponse, gasResponse) // eslint-disable-line
        if (gasPriceResponse && gasPriceResponse.res) {
          gasPrice = gasPriceResponse.res.toNumber()
        }
        if (gasResponse && gasResponse.res) {
          gas = gasResponse.res
        }
      } catch (e) {
        //console.log(e) // eslint-disable-line
        throw new Error(e)
      }
      const options = {
        from: sendAddr.addr,
        to: '0x0000000000000000000000000000000000000009',
        data: data,
        chainId: window.vnt.version.network,
        gasPrice: gasPrice || 30000000000000,
        gas: gas || 4000000,
        value: 0
      }
      //console.log(options) // eslint-disable-line
      const promise = new Promise(resolve => {
        window.vnt.core.sendTransaction(options, (err, res) => {
          resolve({ err, res })
        })
      })
      yield put({
        type: 'account/setSendResult',
        payload: {
          isLoading: true,
          step: txSteps.waitConfirm
        }
      })
      try {
        const resp = yield promise
        let step
        if (typeof resp.err === 'string' || resp.err) {
          step = txSteps.denied
        } else {
          step = txSteps.query
        }
        if (resp.res) {
          //有交易hash，代表成功，则需要进行一些操作
          // if (callback && typeof callback === 'function') {
          //   yield call(callback)
          // }
        }
        yield put({
          type: 'account/setSendResult',
          payload: {
            err: resp.err,
            txHash: resp.res,
            isLoading: false,
            step,
            funcName
          }
        })
      } catch (e) {
        yield put({
          type: 'account/setSendResult',
          payload: {
            err: e,
            txHash: null,
            isLoading: false,
            step: txSteps.failed
          }
        })
      }
    })
  })
}
