import React, { useReducer, useEffect, Fragment } from 'react'
import { connect } from 'react-redux'

const mapStateToProps = ({ account: { myVotes, proxiedVotes } }) => {
  return {
    myVotes,
    proxiedVotes
  }
}

function VoteDetailProvider(props) {
  const { myVotes, proxiedVotes } = props
  const reducer = (state, action) => {
    switch (action.type) {
      case 'init':
        return { ...state, ...action.payload }
      default:
        throw new Error()
    }
  }
  const [state, dispatch] = useReducer(reducer, {
    candidates: [],
    useProxy: false,
    lastVoteTime: 0
  })

  useEffect(
    () => {
      // myVotes为空; proxy不为空，但是proxiedVotes为空，
      const myVoteDetail = myVotes && myVotes.data ? myVotes.data : null
      const proxiedVoteDetail =
        proxiedVotes && proxiedVotes.data ? proxiedVotes.data : null
      if (
        !myVoteDetail ||
        (parseInt(myVoteDetail.proxy, 16) && !proxiedVoteDetail)
      ) {
        return
      }
      const initState = {}
      if (!parseInt(myVoteDetail.proxy, 16)) {
        // 未使用代理
        initState.candidates = myVoteDetail.voteCandidates || []
        initState.useProxy = false
      } else {
        //使用了代理
        initState.candidates = proxiedVoteDetail.voteCandidates || []
        initState.useProxy = true
      }
      initState.lastVoteTime = myVoteDetail.lastVoteTimeStamp * 1000 || 0
      dispatch({
        type: 'init',
        payload: initState
      })
    },
    [myVotes, proxiedVotes]
  )

  //直接是渲染Table??
  return <Fragment>{props.render(state)}</Fragment>
}

export default connect(mapStateToProps)(VoteDetailProvider)
