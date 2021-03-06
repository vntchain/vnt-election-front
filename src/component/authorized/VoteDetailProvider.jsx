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
  //console.log('测试voteDetail更改',myVotes,proxiedVotes) // eslint-disable-line
  const reducer = (state, action) => {
    switch (action.type) {
      case 'init':
        return { ...state, ...action.payload }
      default:
        console.error('undefined action type!') // eslint-disable-line
    }
  }
  const [state, dispatch] = useReducer(reducer, {
    candidates: [],
    useProxy: false,
    lastVoteTime: 0
  })

  useEffect(() => {
    // myVotes为空; proxy不为空，但是proxiedVotes为空，
    const myVoteDetail = myVotes && myVotes.data ? myVotes.data : null
    const proxiedVoteDetail =
      proxiedVotes && proxiedVotes.data ? proxiedVotes.data : null
    const initState = {}
    if (
      !myVoteDetail ||
      (parseInt(myVoteDetail.proxy, 16) && !proxiedVoteDetail)
    ) {
      initState.candidates = []
      initState.useProxy = false
      initState.lastVoteTime = 0
    } else {
      if (!parseInt(myVoteDetail.proxy, 16)) {
        // 未使用代理
        initState.candidates = myVoteDetail.voteCandidates || []
        initState.useProxy = false
      } else {
        //使用了代理
        initState.candidates = proxiedVoteDetail.voteCandidates || []
        initState.useProxy = true
      }
      initState.lastVoteTime = myVoteDetail.lastVoteTimeStamp
        ? parseInt(myVoteDetail.lastVoteTimeStamp) * 1000
        : 0
    }
    dispatch({
      type: 'init',
      payload: initState
    })
  }, [myVotes, proxiedVotes])

  //直接是渲染Table??
  return <Fragment>{props.render(state)}</Fragment>
}

export default connect(mapStateToProps)(VoteDetailProvider)
