import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import VNT from 'vnt'
import { rpc, txActions } from 'constants/config'
import { FormattedMessage, injectIntl } from '@translate'
import { Tooltip, Icon, Switch, Input, Button } from 'antd'
import { format } from 'date-fns'
import { calcVotes, sliceNum } from 'utils/tools'
import Margin from 'component/layout/Margin'

import MessageConfirm from 'component/MessageConfirm'

import styles from './Authorized.scss'

const vnt = new VNT(new VNT.providers.HttpProvider(rpc))

const mapStateToProps = ({
  account: { balance, stake, myVotes, proxiedVotes }
}) => {
  return {
    balance,
    stake,
    myVotes,
    proxiedVotes
  }
}

function AcctDetail(props) {
  const { balance, stake, myVotes, proxiedVotes } = props
  const balanceDecimal =
    balance && balance.data ? parseInt(balance.data) / Math.pow(10, 18) : 0
  const voteDetail =
    myVotes &&
    myVotes.data &&
    myVotes.data.proxy &&
    parseInt(myVotes.data.proxy)
      ? proxiedVotes
      : myVotes
  const lastVoteTime =
    voteDetail && voteDetail.data && voteDetail.data.lastVoteTimeStamp
      ? voteDetail.data.lastVoteTimeStamp * 1000
      : Date.now()

  const details = {
    balance: balanceDecimal,
    stake: (stake && stake.data && stake.data.stakeCount) || 0,
    votes:
      (voteDetail && voteDetail.data && voteDetail.data.lastVoteCount) || 0,
    useProxy:
      myVotes &&
      myVotes.data &&
      myVotes.data.proxy &&
      parseInt(myVotes.data.proxy)
        ? true
        : false,
    voteTime: format(new Date(lastVoteTime), 'YYYY/MM/DD'),
    isProxy: (myVotes && myVotes.data && myVotes.data.isProxy) || false
  }

  details.proxyAddr = details.useProxy ? myVotes.data.proxy : null
  details.proxyVotes = details.isProxy ? myVotes.data.proxyVoteCount : 0

  const [showEstimation, setShowEstimation] = useState(false)
  const [estimatedVotes, setEstimatedVotes] = useState(0)
  const [amount, setAmount] = useState('')
  const [model1, showModel1] = useState(false)
  const [addrErr, setAddrErr] = useState(false)
  const [settedProxyAddr, changeSettedProxyAddr] = useState('')

  const validateInput = e => {
    if (e.target.value && !vnt.isAddress(e.target.value)) {
      setAddrErr(true)
    }
  }

  const approveSetProxyAddr = () => {
    if (settedProxyAddr && !addrErr) {
      return true
    }
    return false
  }

  const handleInputProxyAddr = e => {
    setAddrErr(false)
    changeSettedProxyAddr(e.target.value.trim())
  }

  const handleSetProxyAddr = e => {
    console.log(e) //eslint-disable-line
    //发送设置委托人的交易
    props.dispatch({
      type: 'account/sendTx',
      payload: {
        funcName: txActions.setProxy,
        needInput: true,
        inputData: [settedProxyAddr]
      }
    })
  }

  const handleInputVNT = e => {
    const value = e.target.value
    if (isNaN(value.trim())) {
      // 不允许非法
      return
    } else if (
      details.balance !== 0 &&
      parseFloat(value.trim()) <= details.balance
    ) {
      setAmount(value.trim())
      setEstimatedVotes(calcVotes(parseFloat(value.trim())))
      setShowEstimation(true)
    } else if (value.trim() === '') {
      setAmount('')
      setEstimatedVotes(0)
      setShowEstimation(false)
    }
  }

  const handleFreeze = () => {
    if (parseInt(amount) == amount && parseInt(amount) > 0) {
      // 是整数,发送交易，显示模态框
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: txActions.stake,
          needInput: true,
          inputData: [amount]
        }
      })
    } else {
      showModel1(true)
    }
  }

  const handleUnfreeze = () => {
    // 解抵押是全部解抵押
    props.dispatch({
      type: 'account/sendTx',
      payload: {
        funcName: 'unStake',
        needInput: false
      }
    })
  }

  const handleChangeSwitch = checked => {
    if (checked) {
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: 'startProxy',
          needInput: false
        }
      })
    } else {
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: 'stopProxy',
          needInput: false
        }
      })
    }
  }

  console.log('测试函数组件数据更新是否引起装载和卸载') //eslint-disable-line

  useEffect(() => {
    if (details.useProxy && details.proxyAddr) {
      props.dispatch({
        type: 'fetchRPCData/getRPCdata',
        payload: {
          addr: details.proxyAddr,
          method: 'core_getVoter',
          field: 'proxiedVotes'
        }
      })
      props.dispatch({
        type: 'account/setProxyAddr',
        payload: details.proxyAddr
      })
    }
  }, [])

  return (
    <Fragment>
      <div className={styles.detail}>
        <ul className={styles.wrap}>
          <li className={`${styles['item']} ${styles['item3']}`}>
            <p>{details.balance}</p>
            <h5>
              <FormattedMessage id="htitle1" />
            </h5>
            <img alt="" src={require('@images/detail/1.png')} />
          </li>
          <li className={`${styles['item']} ${styles['item3']}`}>
            <p>{details.stake}</p>
            <h5>
              <FormattedMessage id="htitle2" />
            </h5>
            <img alt="" src={require('@images/detail/2.png')} />
          </li>
          <li className={`${styles['item']} ${styles['item3']}`}>
            <p>
              {details.votes}
              {details.useProxy && (
                <Tooltip
                  title={<FormattedMessage id="htooltip1" />}
                  placement="bottom"
                >
                  <span>
                    <FormattedMessage id="htitle12" />
                  </span>
                </Tooltip>
              )}
            </p>
            <h5>
              <FormattedMessage id="htitle3" />
              {` (${details.voteTime}) `}
              <Tooltip
                title={<FormattedMessage id="htooltip2" />}
                placement="bottom"
              >
                <Icon type="question-circle" />
              </Tooltip>
            </h5>
            <img alt="" src={require('@images/detail/3.png')} />
          </li>
        </ul>
        <Margin />
        <ul className={styles.wrap}>
          <li className={`${styles['item']} ${styles['item2']}`}>
            <div className={styles.input}>
              <div>
                <FormattedMessage id="htitle15" />
                {showEstimation && (
                  <span>
                    <FormattedMessage id="htitle4" />
                    {estimatedVotes}
                    <Tooltip
                      title={<FormattedMessage id="htooltip3" />}
                      placement="bottom"
                    >
                      <Icon
                        type="question-circle"
                        style={{ marginLeft: '.04rem' }}
                      />
                    </Tooltip>
                  </span>
                )}
              </div>
              <input onChange={handleInputVNT} value={amount} />
            </div>
            {details.balance > 0 ? (
              <button
                className={`${styles['freeze']} ${styles['action']}`}
                onClick={handleFreeze}
              >
                <FormattedMessage id="htitle13" />
              </button>
            ) : (
              <div className={`${styles['disable']} ${styles['action']}`}>
                <FormattedMessage id="htitle13" />
              </div>
            )}
          </li>
          <li className={`${styles['item']} ${styles['item2']}`}>
            <div className={styles.stakeCount}>
              <FormattedMessage id="htitle5" />
              <p> {`${details.stake} VNT`} </p>
            </div>
            {details.stake > 0 ? (
              <button
                className={`${styles['unfreeze']} ${styles['action']}`}
                onClick={handleUnfreeze}
              >
                <FormattedMessage id="htitle14" />
              </button>
            ) : (
              <div className={`${styles['disable']} ${styles['action']}`}>
                <FormattedMessage id="htitle14" />
              </div>
            )}
          </li>
        </ul>
        <MessageConfirm
          id="modal1"
          visible={model1}
          onCancel={() => showModel1(false)}
        />
      </div>
      <Margin />
      <div>
        <div className={styles.proxy}>
          <div>
            <FormattedMessage id="htitle6" />
            <Tooltip
              title={<FormattedMessage id="htooltip4" />}
              placement="bottomLeft"
            >
              <span className={styles.proxyTooltip}>
                <Icon type="question-circle" theme="filled" />
              </span>
            </Tooltip>
          </div>
          <div>
            {details.useProxy ? (
              <div>
                <FormattedMessage id="htitle16" />
                {` ${details.proxyAddr} `}
              </div>
            ) : (
              <div className={styles.setProxyAddr}>
                <span>
                  <FormattedMessage id="htitle7" />
                </span>
                <Input
                  onBlur={validateInput}
                  onChange={handleInputProxyAddr}
                  value={settedProxyAddr}
                  placeholder={props.intl.messages['htitle18']}
                />
                <Button
                  disabled={!approveSetProxyAddr()}
                  onClick={handleSetProxyAddr}
                  type="primary"
                >
                  <FormattedMessage id="htitle17" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <Margin />
        <div className={styles.proxy}>
          <div>
            <FormattedMessage id="htitle8" />
            <Tooltip
              title={<FormattedMessage id="htooltip5" />}
              placement="bottomLeft"
            >
              <span className={styles.proxyTooltip}>
                <Icon type="question-circle" theme="filled" />
              </span>
            </Tooltip>
            <span className={styles.proxyVotes}>
              {`( ${props.intl.messages['htitle9']} ${sliceNum(
                details.proxyVotes
              )} )`}
            </span>
          </div>
          <div className={styles.switchProxy}>
            <Switch
              defaultChecked={details.isProxy}
              onChange={handleChangeSwitch}
            />
            <span>
              {details.isProxy ? (
                <FormattedMessage id="htitle11" />
              ) : (
                <FormattedMessage id="htitle10" />
              )}
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default connect(mapStateToProps)(injectIntl(AcctDetail))
