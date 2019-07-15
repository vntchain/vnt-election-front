import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { txActions, forbiddenActionTime } from 'constants/config'
import { FormattedMessage, injectIntl } from '@translate'
import { Tooltip, Icon, Switch, Input, Button, message } from 'antd'
import { format } from 'date-fns'
import { calcVotes, sliceNum, lessThanOneDay, setPrecision } from 'utils/tools'
import Margin from 'component/layout/Margin'
import CountDown from 'component/CountDownNewFormat'

import MessageConfirm from 'component/MessageConfirm'

import { rpcInstance } from 'utils/axios'
import { intervalManagerApp } from 'utils/interval'

import styles from './Authorized.scss'

const intervalManagerInstance = new intervalManagerApp()

const mapStateToProps = ({
  account: { balance, stake, myVotes },
  fetchRPCData: { rpc },
  intervalManager: { detailStakeTimer, detailVoteTimer }
}) => {
  return {
    balance,
    stake,
    myVotes,
    rpc,
    detailStakeTimer,
    detailVoteTimer
  }
}

function AcctDetail(props) {
  const [details, setDetails] = useState({
    balance: 0,
    stake: 0,
    hasStaked: false,
    lastStakeTime: 0,
    votes: 0,
    hasVoted: false,
    lastVoteTime: 0,
    useProxy: false,
    proxyAddr: null,
    isProxy: false,
    proxyVotes: 0
  })
  const [showEstimation, setShowEstimation] = useState(false)
  const [estimatedVotes, setEstimatedVotes] = useState(0)
  const [amount, setAmount] = useState('')
  const [messageModal, showMessageModal] = useState(false)
  const [modalID, setModalID] = useState('')
  const [settedProxyAddr, changeSettedProxyAddr] = useState('')

  const isAddrValid = addr => {
    if (addr && addr.length === 42 && window.vnt.isAddress(addr)) {
      return true
    }
    return false
  }

  const handleInputProxyAddr = e => {
    changeSettedProxyAddr(e.target.value.trim())
  }

  const handleSetProxyAddr = async () => {
    if (!isAddrValid(settedProxyAddr)) {
      showMessageModal(true)
      setModalID('modal10')
    } else if (details.isProxy) {
      showMessageModal(true)
      setModalID('modal6')
    } else if (details.stake === 0) {
      showMessageModal(true)
      setModalID('modal5')
    } else {
      // 拿到地址 去查询账户信息
      try {
        let res = await rpcInstance.post(
          '/',
          {
            jsonrpc: '2.0',
            method: 'core_getVoter', // 'core_getBalance' ,
            params: [settedProxyAddr],
            id: 1
          },
          { baseURL: props.rpc }
        )
        res = res.data
        if (
          (res && !res.result) ||
          (res && res.result && !res.result.isProxy)
        ) {
          showMessageModal(true)
          setModalID('modal7')
        } else {
          //发送设置委托人的交易
          props.dispatch({
            type: 'account/sendTx',
            payload: {
              funcName: txActions.setProxy,
              needInput: true,
              inputData: [settedProxyAddr]
            },
            callback: () =>
              handleTxSuccessResult(txActions.setProxy, '', settedProxyAddr)
          })
        }
      } catch (e) {
        message.error('get proxyVotes detail error!') 
      }
    }
    // changeSettedProxyAddr('')
  }

  const handleCancelProxy = () => {
    // 取消委托，任何时候都可以进行操作
    props.dispatch({
      type: 'account/sendTx',
      payload: {
        funcName: txActions.cancelProxy,
        needInput: false
      },
      callback: () => handleTxSuccessResult(txActions.cancelProxy)
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
    if (parseInt(amount, 10) == amount && parseInt(amount, 10) > 0) {
      // 是整数,发送交易，显示模态框
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: txActions.stake,
          needInput: false,
          inputData: parseInt(amount, 10) * Math.pow(10, 18)
        },
        callback: () => handleTxSuccessResult(txActions.stake, amount)
      })
    } else {
      showMessageModal(true)
      setModalID('modal1')
    }
    // setAmount('')
    // setEstimatedVotes(0)
    // setShowEstimation(false)
  }

  const handleUnfreeze = () => {
    // 解抵押是全部解抵押
    props.dispatch({
      type: 'account/sendTx',
      payload: {
        funcName: txActions.unStake,
        needInput: false
      },
      callback: () => handleTxSuccessResult(txActions.unStake)
    })
  }

  const handleChangeSwitch = checked => {
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
          },
          callback: () => handleTxSuccessResult(txActions.startProxy)
        })
      }
    } else {
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: txActions.stopProxy,
          needInput: false
        },
        callback: () => handleTxSuccessResult(txActions.stopProxy)
      })
    }
  }

  const handleTxSuccessResult = (funcName, amount = '', proxyAddr = null) => {
    switch (funcName) {
      case txActions.stake: {
        // 此处最好再判断一下amount是否非法
        if (isNaN(amount)) {
          message.error('invalid amount!') 
        }
        const deltaVnt = parseInt(amount, 10)
        const newBalance = details.balance - deltaVnt
        const newStake = details.stake + deltaVnt
        const newVotes = calcVotes(newStake)
        setDetails(
          Object.assign({}, details, {
            balance: newBalance,
            stake: newStake,
            votes: newVotes,
            hasStaked: true,
            lastStakeTime: Date.now()
          })
        )
        props.dispatch({
          type: 'calculatedDetails/setStake',
          payload: newStake
        })
        break
      }
      case txActions.unStake: {
        const newBalance = details.balance + details.stake
        setDetails(
          Object.assign({}, details, {
            balance: newBalance,
            stake: 0,
            votes: 0
          })
        )
        props.dispatch({
          type: 'calculatedDetails/setStake',
          payload: 0
        })
        break
      }
      case txActions.setProxy: {
        setDetails(
          Object.assign({}, details, {
            proxyAddr: proxyAddr,
            useProxy: true,
            lastVoteTime: Date.now()
          })
        )
        break
      }
      case txActions.cancelProxy: {
        setDetails(
          Object.assign({}, details, {
            proxyAddr: null,
            useProxy: false
          })
        )
        break
      }
      case txActions.startProxy: {
        setDetails(
          Object.assign({}, details, {
            isProxy: true
          })
        )
        break
      }
      case txActions.stopProxy: {
        setDetails(
          Object.assign({}, details, {
            isProxy: false
          })
        )
        break
      }
      default:
        message.error('undefined vote actions!') 
    }
  }

  const storeIntervalData = (key, timerId, time) => {
    props.dispatch({
      type: 'intervalManager/setState',
      payload: {
        key,
        timerId,
        time
      }
    })
  }

  useEffect(
    () => {
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
      } else {
        props.dispatch({
          type: 'account/setProxiedVotes',
          payload: null
        })
      }
    },
    [details.useProxy, details.proxyAddr]
  )

  useEffect(
    () => {
      //console.log('计算details: ', props) //eslint-disable-line
      const { balance, myVotes, stake } = props
      const newDetails = {}
      // 余额
      newDetails.balance =
        balance && balance.data
          ? setPrecision(parseInt(balance.data, 16) / Math.pow(10, 18), 8)
          : 0
      // 抵押VNT的数量
      newDetails.stake =
        stake && stake.data
          ? stake.data.vnt
            ? parseInt(stake.data.vnt) / Math.pow(10, 18)
            : stake.data.stakeCount
              ? parseInt(stake.data.stakeCount)
              : 0
          : 0
      // 是否产生过抵押
      newDetails.hasStaked =
        stake && stake.data && stake.data.lastStakeTimeStamp
          ? parseInt(stake.data.lastStakeTimeStamp) !== 0
          : false
      // 上次抵押时间
      newDetails.lastStakeTime = newDetails.hasStaked
        ? parseInt(stake.data.lastStakeTimeStamp) * 1000
        : 0
      // 票数
      newDetails.votes =
        myVotes && myVotes.data && myVotes.data.lastVoteCount
          ? parseInt(myVotes.data.lastVoteCount)
          : 0
      // 是否投过票
      newDetails.hasVoted =
        myVotes && myVotes.data && myVotes.data.lastVoteTimeStamp
          ? parseInt(myVotes.data.lastVoteTimeStamp) !== 0
          : false
      // 上次投票时间
      newDetails.lastVoteTime = newDetails.hasVoted
        ? parseInt(myVotes.data.lastVoteTimeStamp) * 1000
        : 0
      // 是否使用代理
      newDetails.useProxy =
        myVotes &&
        myVotes.data &&
        myVotes.data.proxy &&
        parseInt(myVotes.data.proxy, 16)
          ? true
          : false
      // 代理地址
      newDetails.proxyAddr = newDetails.useProxy ? myVotes.data.proxy : null
      // 是否开启代理，即帮别人投票的功能
      newDetails.isProxy =
        (myVotes && myVotes.data && myVotes.data.isProxy) || false
      // 帮别人投票的票数
      newDetails.proxyVotes =
        myVotes && myVotes.data && myVotes.data.proxyVoteCount
          ? parseInt(myVotes.data.proxyVoteCount)
          : 0

      for (let idx in newDetails) {
        if (newDetails[idx] !== details[idx]) {
          if (
            newDetails.hasStaked &&
            lessThanOneDay(newDetails.lastStakeTime)
          ) {
            // key, deadline, updateDataFn
            intervalManagerInstance.newInterval(
              'detailStakeTimer',
              Math.floor(
                (forbiddenActionTime + newDetails.lastStakeTime - Date.now()) /
                  1000
              ),
              storeIntervalData
            )
          } else {
            intervalManagerInstance.clearInterval(
              'detailStakeTimer',
              storeIntervalData
            )
          }

          if (newDetails.hasVoted && lessThanOneDay(newDetails.lastVoteTime)) {
            intervalManagerInstance.newInterval(
              'detailVoteTimer',
              Math.floor(
                (forbiddenActionTime + newDetails.lastVoteTime - Date.now()) /
                  1000
              ),
              storeIntervalData
            )
          } else {
            intervalManagerInstance.clearInterval(
              'detailVoteTimer',
              storeIntervalData
            )
          }

          setDetails(newDetails)
          // 此时清空内部状态？？？
          setAmount('')
          setEstimatedVotes(0)
          setShowEstimation(false)
          changeSettedProxyAddr('')
          break
        }
      }
    },
    [props.balance, props.stake, props.myVotes]
  )

  useEffect(
    () => {
      props.dispatch({
        type: 'calculatedDetails/setStake',
        payload: details.stake
      })
    },
    [details.stake]
  )

  // const forceUpdate = useState(0)[1]
  // const onCountDownFinish = () => {
  //   // 倒计时结束，强制渲染
  //   console.log('倒计时结束...') // eslint-disable-line
  //   forceUpdate()
  // }

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
                  <span className={styles.votesProxy}>
                    <FormattedMessage id="htitle12" />
                  </span>
                </Tooltip>
              )}
            </p>
            <h5>
              <FormattedMessage id="htitle3" />
              {details.hasVoted &&
                ` (${format(new Date(details.lastVoteTime), 'YYYY/MM/DD')}) `}
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
            ) : details.hasStaked && lessThanOneDay(details.lastStakeTime) ? (
              <div className={`${styles['countDown']} ${styles['action']}`}>
                <FormattedMessage id="htitle14" label={true} />
                <CountDown
                  time={
                    (props.detailStakeTimer && props.detailStakeTimer.time) || 0
                  }
                />
                {/* <CountDown
                  time={details.lastStakeTime}
                  onFinish={onCountDownFinish}
                  totalCountDownTime={forbiddenActionTime}
                /> */}
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
                  onChange={handleInputProxyAddr}
                  value={settedProxyAddr}
                  placeholder={props.intl.messages['htitle18']}
                />
                {details.hasVoted && lessThanOneDay(details.lastVoteTime) ? (
                  <div className={styles.btnCountDown}>
                    <FormattedMessage id="htitle17" label={true} />
                    <CountDown
                      time={
                        (props.detailVoteTimer && props.detailVoteTimer.time) ||
                        0
                      }
                    />
                    {/* <CountDown
                      time={details.lastVoteTime}
                      onFinish={onCountDownFinish}
                      totalCountDownTime={forbiddenActionTime}
                    /> */}
                  </div>
                ) : (
                  <Button onClick={handleSetProxyAddr} type="primary">
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
              {`( ${props.intl.messages['htitle9']} ${
                details.isProxy ? sliceNum(details.proxyVotes) : 0
              } )`}
            </span>
          </div>
          <div className={styles.switchProxy}>
            <Switch checked={details.isProxy} onChange={handleChangeSwitch} />
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
