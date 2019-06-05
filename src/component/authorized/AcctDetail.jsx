import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import VNT from 'vnt'
import { rpc, txActions } from 'constants/config'
import { FormattedMessage, injectIntl } from '@translate'
import { Tooltip, Icon, Switch, Input, Button } from 'antd'
import { format } from 'date-fns'
import { calcVotes, sliceNum, lessThanOneDay } from 'utils/tools'
import Margin from 'component/layout/Margin'
import CountDown from 'component/CountDown'

import MessageConfirm from 'component/MessageConfirm'

import styles from './Authorized.scss'

const vnt = new VNT(new VNT.providers.HttpProvider(rpc))

const mapStateToProps = ({ account: { balance, stake, myVotes } }) => {
  return {
    balance,
    stake,
    myVotes
  }
}

function AcctDetail(props) {
  const { balance, stake, myVotes } = props
  const balanceDecimal =
    balance && balance.data ? parseInt(balance.data) / Math.pow(10, 18) : 0
  const hasVoted =
    myVotes && myVotes.data && myVotes.data.lastVoteTimeStamp ? true : false
  const hasStaked =
    stake && stake.data && stake.data.lastStakeTimeStamp ? true : false
  const lastVoteTime = hasVoted ? myVotes.data.lastVoteTimeStamp * 1000 : 0
  const lastStakeTime = hasStaked ? stake.data.lastStakeTimeStamp * 1000 : 0

  const details = {
    balance: balanceDecimal,
    stake: (stake && stake.data && stake.data.stakeCount) || 0,
    // 上次抵押时间
    stakeTime: lastStakeTime,
    // 票数
    votes: (myVotes && myVotes.data && myVotes.data.lastVoteCount) || 0,
    // 是否使用代理来帮我投票
    useProxy:
      myVotes &&
      myVotes.data &&
      myVotes.data.proxy &&
      parseInt(myVotes.data.proxy)
        ? true
        : false,
    //上次投票(或者设置代理)时间
    voteTime: format(new Date(lastVoteTime), 'YYYY/MM/DD'),
    //是否开启了代理功能
    isProxy: (myVotes && myVotes.data && myVotes.data.isProxy) || false
  }
  //使用了代理，代理人的地址
  details.proxyAddr = details.useProxy ? myVotes.data.proxy : null
  //作为代理给别人投的票数
  details.proxyVotes = details.isProxy ? myVotes.data.proxyVoteCount : 0
  // 投给了谁,使用了代理，则取代理的
  //const voteDetail = details.useProxy ? proxiedVotes.voteCandidates : myVotes.voteCandidates

  const [showEstimation, setShowEstimation] = useState(false)
  const [estimatedVotes, setEstimatedVotes] = useState(0)
  const [amount, setAmount] = useState('')
  const [messageModal, showMessageModal] = useState(false)
  const [modalID, setModalID] = useState('')
  const [addrErr, setAddrErr] = useState(false)
  const [settedProxyAddr, changeSettedProxyAddr] = useState('')
  const [switchStatus, changeSwitchStatus] = useState(false)

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

  const handleCancelProxy = e => {
    console.log(e) //eslint-disable-line
    // 取消委托，任何时候都可以进行操作
    props.dispatch({
      type: 'account/sendTx',
      payload: {
        funcName: txActions.cancelProxy,
        needInput: false
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
      showMessageModal(true)
      setModalID('modal1')
    }
  }

  const handleUnfreeze = () => {
    // 解抵押是全部解抵押
    props.dispatch({
      type: 'account/sendTx',
      payload: {
        funcName: txActions.unStake,
        needInput: false
      }
    })
  }

  const handleChangeSwitch = checked => {
    console.log(checked) //eslint-disable-line
    changeSwitchStatus(checked)
    if (checked) {
      if (details.useProxy) {
        showMessageModal(true)
        setModalID('modal8')
      } else {
        props.dispatch({
          type: 'account/sendTx',
          payload: {
            funcName: txActions.startProxy,
            needInput: false
          }
        })
      }
    } else {
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: txActions.stopProxy,
          needInput: false
        }
      })
    }
  }

  useEffect(
    () => {
      console.log('测试函数组件useEffect是不是每次更新props都进入') //eslint-disable-line
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
    },
    [details.useProxy, details.proxyAddr]
  )
  useEffect(
    () => {
      // 监听isProxy的变化？去改变开关的状态
      changeSwitchStatus(details.isProxy)
    },
    [details.isProxy]
  )

  console.log('重新渲染页面了吗？？') // eslint-disable-line
  const forceUpdate = useState(0)[1]
  const onCountDownFinish = () => {
    // 倒计时结束，强制渲染
    console.log('倒计时结束...') // eslint-disable-line
    forceUpdate()
  }

  return (
    <Fragment>
      <div className={styles.detail}>
        <ul className={styles.wrap}>
          <li className={`${styles['item']} ${styles['item3']}`}>
            <p>{`${details.balance}`.slice(0, 16)}</p>
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
              {hasVoted && ` (${details.voteTime}) `}
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
            {details.stake == 0 ? (
              <div className={`${styles['disable']} ${styles['action']}`}>
                <FormattedMessage id="htitle14" label={true} />
              </div>
            ) : hasStaked && lessThanOneDay(details.lastStakeTime) ? (
              <div className={`${styles['countDown']} ${styles['action']}`}>
                <FormattedMessage id="htitle14" label={true} />
                <CountDown
                  time={details.lastStakeTime}
                  onFinish={onCountDownFinish}
                />
              </div>
            ) : (
              <button
                className={`${styles['unfreeze']} ${styles['action']}`}
                onClick={handleUnfreeze}
              >
                <FormattedMessage id="htitle14" />
              </button>
            )}
          </li>
        </ul>
        <MessageConfirm
          id={modalID}
          visible={messageModal}
          onCancel={() => showMessageModal(false)}
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
              <div className={styles.cancelProxy}>
                <FormattedMessage id="htitle16" />
                {` ${details.proxyAddr} `}
                <Button onClick={handleCancelProxy}>
                  <FormattedMessage id="htitle19" />
                </Button>
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
                {hasVoted && lessThanOneDay(details.lastVoteTime) ? (
                  <div className={styles.btnCountDown}>
                    <FormattedMessage id="htitle17" label={true} />
                    <CountDown
                      time={details.lastVoteTime}
                      onFinish={onCountDownFinish}
                    />
                  </div>
                ) : (
                  <Button
                    disabled={!approveSetProxyAddr()}
                    onClick={handleSetProxyAddr}
                    type="primary"
                  >
                    <FormattedMessage id="htitle17" />
                  </Button>
                )}
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
            <Switch checked={switchStatus} onChange={handleChangeSwitch} />
            <span>
              {switchStatus ? (
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
