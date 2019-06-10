import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'
import VNT from 'vnt'
import { rpc } from 'constants/config'
const vnt = new VNT(new VNT.providers.HttpProvider(rpc))

const mapStateToProps = ({ account: { accountAddr, sendResult } }) => {
  return {
    accountAddr,
    sendResult
  }
}

function getTransactionReceipt(tx, cb) {
  var receipt = vnt.core.getTransactionReceipt(tx)
  if (!receipt) {
    setTimeout(function() {
      getTransactionReceipt(tx, cb)
    }, 2000)
  } else {
    cb(receipt)
  }
}

function Authorized(props) {
  const handleReceipt = receipt => {
    if (receipt.status == '0x1') {
      // 代表交易成功 此时需要去重新取rpc的数据
    } else {
      // 代表交易失败
    }
  }

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

  useEffect(
    async () => {
      const sendResult = props.sendResult
      if (sendResult.txHash) {
        getTransactionReceipt(sendResult.txHash, handleReceipt)
      }
    },
    [props.sendResult]
  )

  return (
    <Fragment>
      <AcctAddr />
      <Margin />
      <AcctDetail />
    </Fragment>
  )
}

export default connect(mapStateToProps)(Authorized)
