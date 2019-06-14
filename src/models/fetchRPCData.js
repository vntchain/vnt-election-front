import { effects } from 'redux-sirius'
import { rpcInstance } from 'utils/axios'
const { put, call, select } = effects

export default {
  state: {
    rpc: null, // rpc
    chainID: 2
  },
  reducers: {},
  effects: ({ takeEvery }) => ({
    getRPCdata: takeEvery(function*({ payload }) {
      const { addr, method, field } = payload
      let baseURL = yield select(({ fetchRPCData: { rpc } }) => rpc)
      const postData = {
        jsonrpc: '2.0',
        method: method, // 'core_getBalance' ,
        params: method === 'core_getBalance' ? [addr, 'latest'] : [addr],
        id: 1
      }
      try {
        let res = yield call(rpcInstance.post, '/', postData, { baseURL })
        res = res.data
        let err = null
        let data = null
        // 含有error ,则不会返回 result字段，若result字段为null，则无数据，否则有数据
        if (typeof res.error !== 'undefined') {
          err = err.code
        } else {
          data = res.result // 没有结果时，数据也可能是null
        }
        const result = {
          field,
          // loadStatus: false,
          data,
          err
        }
        yield put({
          type: 'account/setState',
          payload: result
        })
      } catch (e) {
        console.log(e.message) //eslint-disable-line
        throw new Error(e)
      }
    })
  })
}
