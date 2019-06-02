import { effects } from 'redux-sirius'
import { rpcInstance } from 'utils/axios'
const { put, call } = effects

export default {
  state: {},
  reducers: {},
  effects: ({ takeEvery }) => ({
    getRPCdata: takeEvery(function*({ payload }) {
      const { addr, method, field } = payload
      // "0xb0432eB09079F4A5a7Fe4E8Dd5879b14356E27c2"
      const postData = {
        jsonrpc: '2.0',
        method: method, // 'core_getBalance' ,
        params: method === 'core_getBalance' ? [addr, 'latest'] : [addr],
        id: 1
      }
      yield put({
        type: 'account/setLoadingStatus',
        payload: {
          field: field,
          loadStatus: true
        }
      })
      try {
        const res = yield call(rpcInstance.post, postData)
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
          loadStatus: false,
          data,
          err
        }
        yield put({
          type: 'account/setState',
          payload: result
        })
      } catch (e) {
        throw new Error(e)
      }
    })
  })
}
