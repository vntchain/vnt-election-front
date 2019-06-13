import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'
import MessageModal from 'component/authorized/MessageModal'
import { pollingInterval } from 'constants/config'

const mapStateToProps = ({ account: { accountAddr } }) => {
  return {
    accountAddr
  }
}

let detailTimer
function Authorized(props) {
  const requestRPCdataAll = addr => {
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

  useEffect(
    () => {
      clearInterval(detailTimer)
      console.log('acct发生变化') //eslint-disable-line
      if (props.accountAddr.addr) {
        requestRPCdataAll(props.accountAddr.addr)
        detailTimer = setInterval(() => {
          console.log('detail的定时刷新') //eslint-disable-line
          requestRPCdataAll(props.accountAddr.addr)
        }, pollingInterval * 1000)
      }
      return () => clearInterval(detailTimer)
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
