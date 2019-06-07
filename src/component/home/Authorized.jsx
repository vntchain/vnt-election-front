import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'
import MessageModal from 'component/authorized/MessageModal'

const mapStateToProps = ({ account: { accountAddr } }) => {
  return {
    accountAddr
  }
}

function Authorized(props) {
  useEffect(
    () => {
      if (props.accountAddr.addr) {
        const addr = props.accountAddr.addr
        props.dispatch({
          type: 'fetchRPCData/getRPCdata',
          payload: {
            addr,
            method: 'core_getBalance',
            field: 'balance'
          }
        })
        props.dispatch({
          type: 'fetchRPCData/getRPCdata',
          payload: {
            addr,
            method: 'core_getStake',
            field: 'stake'
          }
        })
        props.dispatch({
          type: 'fetchRPCData/getRPCdata',
          payload: {
            addr,
            method: 'core_getVoter',
            field: 'myVotes'
          }
        })
      }
    },
    [props.accountAddr.addr]
  )

  return (
    <Fragment>
      <AcctAddr />
      <Margin />
      <AcctDetail />
      <MessageModal />
    </Fragment>
  )
}

export default connect(mapStateToProps)(Authorized)
