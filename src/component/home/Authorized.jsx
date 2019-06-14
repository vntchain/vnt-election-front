import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'
import MessageModal from 'component/authorized/MessageModal'
import { pollingInterval, walletState, netConfig } from 'constants/config'

const mapStateToProps = ({
  account: { accountAddr },
  fetchRPCData: { rpc }
}) => {
  return {
    accountAddr,
    rpc
  }
}

let detailTimer
function Authorized(props) {
  const requestRPCdataAll = (addr, rpc = null) => {
    if (rpc) {
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
  }

  useEffect(
    () => {
      clearInterval(detailTimer)
      console.log('acct发生变化') //eslint-disable-line
      if (props.accountAddr.addr) {
        requestRPCdataAll(props.accountAddr.addr, props.rpc)
        detailTimer = setInterval(() => {
          console.log('detail的定时刷新') //eslint-disable-line
          requestRPCdataAll(props.accountAddr.addr, props.rpc)
        }, pollingInterval * 1000)
      }
      return () => clearInterval(detailTimer)
    },
    [props.accountAddr.addr]
  )

  useEffect(() => {
    if (window.vnt.getNetworkUrl) {
      try {
        window.vnt.getNetworkUrl((err, result) => {
          // 需要判断result的值，同时修改nodeslist的后端接口，此时无法直接刷新页面，需要仅内部页面刷新
          if (!err && result) {
            if (result === netConfig.mainnet.rpcURL) {
              props.dispatch({
                type: 'fetchRPCData/setRpc',
                payload: result
              })
              props.dispatch({
                type: 'dataRelayNew/setState',
                payload: {
                  nodesAxiosBaseUrl: netConfig.mainnet.nodesURL,
                  nodeAddrBaseurl: netConfig.mainnet.nodeAddr
                }
              })
            } else if (result === netConfig.testnet.rpcURL) {
              props.dispatch({
                type: 'fetchRPCData/setRpc',
                payload: result
              })
              props.dispatch({
                type: 'dataRelayNew/setState',
                payload: {
                  nodesAxiosBaseUrl: netConfig.testnet.nodesURL,
                  nodeAddrBaseurl: netConfig.testnet.nodeAddr
                }
              })
            }
          }
        })
        window.vnt.logout((err, result) => {
          //钱包登出，此时需要清除状态
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

  useEffect(
    () => {
      requestRPCdataAll(props.accountAddr.addr, props.rpc)
    },
    [props.rpc]
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
