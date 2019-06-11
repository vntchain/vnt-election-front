import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'
import MessageModal from 'component/authorized/MessageModal'
import VNT from 'vnt'
import { rpc, txActions, txSteps } from 'constants/config'
const vnt = new VNT(new VNT.providers.HttpProvider(rpc))

const mapStateToProps = ({ account: { accountAddr, sendResult } }) => {
  return {
    accountAddr,
    sendResult
  }
}

const requestType = {
  all: 'all',
  vote: 'onlyVote'
}

let timer = null

function Authorized(props) {
  const handleReceipt = (funcName, receipt) => {
    if (!props.accountAddr.addr) {
      throw new Error(' no account addr!')
    }
    if (receipt.status == '0x1') {
      // 代表交易成功 此时需要去重新取rpc的数据
      props.dispatch({
        type: 'account/setSendResult',
        payload: {
          step: txSteps.txSuccess,
          getTxResult: true
        }
      })
      if (funcName === txActions.stake || funcName === txActions.unStake) {
        // 需要获取三个rpc节点
        requestRPCData(props.accountAddr.addr, requestType.all)
      } else {
        // 仅需要获取投票
        requestRPCData(props.accountAddr.addr, requestType.vote)
      }
    } else {
      // 代表交易失败
      props.dispatch({
        type: 'account/setSendResult',
        payload: {
          step: txSteps.txFailed,
          getTxResult: true
        }
      })
      requestRPCData(props.accountAddr.addr, requestType.all)
    }
  }

  const getTransactionReceipt = (tx, cb) => {
    var receipt = vnt.core.getTransactionReceipt(tx)
    if (!receipt) {
      console.log('开始2s轮询。。。。') //eslint-disable-line
      timer = setTimeout(function() {
        getTransactionReceipt(tx, cb)
      }, 2000)
    } else {
      clearTimeout(timer)
      cb(receipt)
    }
  }

  const requestRPCData = (addr, type) => {
    if (type === requestType.vote) {
      props.dispatch({
        type: 'fetchRPCData/getRPCdata',
        payload: {
          addr,
          method: 'core_getVoter',
          field: 'myVotes'
        }
      })
    } else {
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
      if (props.accountAddr.addr) {
        const addr = props.accountAddr.addr
        requestRPCData(addr, requestType.all)
      }
    },
    [props.accountAddr.addr]
  )

  useEffect(
    () => {
      const sendResult = props.sendResult
      if (
        sendResult &&
        sendResult.txHash &&
        sendResult.step === txSteps.succeed
      ) {
        getTransactionReceipt(sendResult.txHash, receipt =>
          handleReceipt(sendResult.funcName, receipt)
        )
        props.dispatch({
          type: 'account/setSendResult',
          payload: {
            step: txSteps.query,
            getTxResult: false
          }
        })
      }
    },
    [props.sendResult]
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
