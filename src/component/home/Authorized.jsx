import React, { Fragment, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'
import MessageModal from 'component/authorized/MessageModal'
import { pollingInterval, walletState } from 'constants/config'

const mapStateToProps = ({
  account: { accountAddr },
  fetchRPCData: { rpc }
}) => {
  return {
    accountAddr,
    rpc
  }
}

function Authorized(props) {
  const timer = useRef(null)
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
      clearInterval(timer.current)
      if (props.accountAddr.addr && props.rpc) {
        //console.log('acct或者rpc发生变化, addr=', props.accountAddr.addr, 'rpc=',props.rpc) //eslint-disable-line
        requestRPCdataAll(props.accountAddr.addr)
        timer.current = setInterval(() => {
          //console.log('detail的定时刷新') //eslint-disable-line
          requestRPCdataAll(props.accountAddr.addr)
        }, pollingInterval * 1000)
      }
      return () => clearInterval(timer.current)
    },
    [props.accountAddr.addr, props.rpc]
  )

  useEffect(() => {
    if (window.vnt.logout) {
      try {
        window.vnt.logout((err, result) => {
          //console.log('调用了logout','err=',err,'result=',result) //eslint-disable-line
          if (!err && result) {
            props.dispatch({
              type: 'auth/setAuthStatus',
              payload: walletState.unauthorized
            })
            props.dispatch({
              type: 'account/clearState'
            })
          }
        })
      } catch (e) {
        throw new Error(e.message)
      }
    }
  }, [])

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
