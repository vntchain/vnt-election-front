import { effects } from 'redux-sirius'

import axios from 'utils/axios'

import { netConfig } from 'constants/config'
const { put, call, select } = effects

const defaultNet = process.env.REACT_APP_DEFAULT_NET.trim()

export default {
  state: {
    nodesAxiosBaseUrl: netConfig[defaultNet].nodesURL,
    nodeAddrBaseurl: netConfig[defaultNet].nodeAddr
  },
  reducers: {
    setState: (state, { payload }) => {
      return { ...state, ...payload }
    }
  },
  effects: ({ takeEvery }) => ({
    fetchData: takeEvery(function*({ payload, callback }) {
      const { path, ns, field } = payload
      const baseURL = yield select(
        ({ dataRelayNew: { nodesAxiosBaseUrl } }) => nodesAxiosBaseUrl
      )
      const method = payload.method || 'get'
      const axiosArgs =
        method === 'post'
          ? {
              baseURL,
              method,
              url: path,
              data: payload.data
            }
          : {
              baseURL,
              method,
              url: path
            }

      yield put({
        type: `${ns}/loadingStatus`,
        payload: {
          field,
          isLoading: true
        }
      })

      try {
        const { data: resp } = yield call(axios, axiosArgs)
        let error
        let data = resp.data
        if (!resp.ok) {
          data = null
          error = resp.err || resp.error
          if (typeof error === 'object' && error !== null) {
            error = error.code
          } else if (typeof error === 'string') {
            // do nothing
          } else {
            error = JSON.stringify(error)
          }
        }
        const result = {
          data,
          error, // string
          isLoading: false,
          count: resp.extra ? resp.extra.count : '--',
          field
        }

        yield put({
          type: `${ns}/setState`,
          payload: result
        })
        //invoke callback
        if (callback && typeof callback === 'function') {
          yield call(callback, ns, result)
        }
      } catch (e) {
        console.error(e.message) // eslint-disable-line
        yield put({
          type: `${ns}/setState`,
          payload: {
            error: e.message,
            data: null,
            isLoading: false,
            field
          }
        })
      }
    })
  })
}
