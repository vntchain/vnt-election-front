export default {
  state: {
    detailStakeTimer: null,
    detailVoteTimer: null
  },
  reducers: {
    setState: (state, { payload }) => {
      const { key, ...data } = payload
      return { ...state, [key]: data }
    }
  }
}
