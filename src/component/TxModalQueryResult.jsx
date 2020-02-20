import React, { useEffect, useState, Fragment, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  txActions,
  txSteps,
  requestTxLimitTime,
  pageSize
} from 'constants/config'
import { getBaseParams } from 'utils/tools'
import { FormattedMessage } from '@translate'
import CountDown from 'component/CountDown'
import { Button, message } from 'antd'
import apis from 'constants/apis'

import styles from './Modal.scss'

const mapStateToProps = ({
  account: { sendResult, accountAddr },
  pageIndex: { nodePageIndex }
}) => {
  return {
    sendResult,
    accountAddr,
    nodePageIndex
  }
}

const requestType = {
  all: 'all',
  vote: 'onlyVote'
}

function TxModalQueryResult(props) {
  const sendResult = props.sendResult
  const [queryResult, setQueryResult] = useState(false)
  const timer = useRef(null)
  const handleReceipt = (funcName, receipt) => {
    if (!props.accountAddr.addr) {
      message.error('no account addr!')
    }
    if (receipt.status == '0x1') {
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
      // 再次获取最新的节点信息 等待2s再去取数据，确保浏览器后端数据拿到最新的
      setTimeout(() => {
        props.dispatch({
          type: 'dataRelayNew/fetchData',
          payload: {
            path: `${apis.nodes}?${getBaseParams(
              props.nodePageIndex,
              pageSize
            )}`,
            ns: 'nodes',
            field: 'nodes'
          }
        })
      }, 2000)
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
    window.vnt.core.getTransactionReceipt(tx, (err, receipt) => {
      if (!receipt && queryResult) {
        timer.current = setTimeout(function() {
          getTransactionReceipt(tx, cb)
        }, 2000)
      } else {
        clearTimeout(timer.current)
        setQueryResult(false)
        cb(receipt)
      }
    })
  }

  const requestRPCData = (addr, type) => {
    if (type === requestType.vote) {
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

  useEffect(() => {
    if (queryResult) {
      try {
        getTransactionReceipt(sendResult.txHash, receipt =>
          handleReceipt(sendResult.funcName, receipt)
        )
      } catch (e) {
        message.error(e.message)
      }
    }
  }, [queryResult])

  useEffect(() => {
    if (sendResult && sendResult.txHash && sendResult.step === txSteps.query) {
      setQueryResult(true)
    }
  }, [props.sendResult])

  const onCountDownFinish = () => {
    setQueryResult(false)
    clearTimeout(timer.current)
  }

  const onClickOk = () => {
    setQueryResult(true)
  }

  const onClickCancel = () => {
    props.onCancel()
    requestRPCData(props.accountAddr.addr, requestType.all)
  }

  const queryCountDown = (
    <Fragment>
      <div className={styles.mainTitle}>
        <FormattedMessage id="txModalTitle8" />
      </div>
      <div className={styles.countDown}>
        <CountDown
          time={Date.now()}
          onFinish={onCountDownFinish}
          totalCountDownTime={requestTxLimitTime}
        />
        <FormattedMessage id="txModalText" />
      </div>
    </Fragment>
  )

  const selectQuery = (
    <Fragment>
      <div className={styles.mainTitle}>
        <FormattedMessage id="txModalTitle9" />
      </div>
      <div className={styles.actions}>
        <Button onClick={onClickOk}>
          <FormattedMessage id="txModalBtn1" />
        </Button>
        <Button onClick={onClickCancel}>
          <FormattedMessage id="txModalBtn2" />
        </Button>
      </div>
    </Fragment>
  )

  return (
    <div className={styles.txModalQueryResult}>
      {queryResult ? queryCountDown : selectQuery}
    </div>
  )
}

export default connect(mapStateToProps)(TxModalQueryResult)

TxModalQueryResult.propTypes = {
  onCancel: PropTypes.func.isRequired
}
