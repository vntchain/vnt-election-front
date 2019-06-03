import React, { useState } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from '@translate'
import { Tooltip, Icon } from 'antd'
import { format } from 'date-fns'
import { calcVotes } from 'utils/tools'

import MessageConfirm from 'component/MessageConfirm'

import styles from './Authorized.scss'

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
    voteTime: format(new Date(lastVoteTime), 'YYYY/MM/DD')
  }

  const [showEstimation, setShowEstimation] = useState(false)
  const [estimatedVotes, setEstimatedVotes] = useState(0)
  const [amount, setAmount] = useState('')
  const [model1, showModel1] = useState(false)

  const handleInput = e => {
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
      console.log('得到整数', amount) //eslint-disable-line
      props.dispatch({
        type: 'account/sendTx',
        payload: {
          funcName: 'stake',
          needInput: true,
          inputData: [amount]
        }
      })
    } else {
      showModel1(true)
    }
  }

  const handleUnfreeze = () => {
    console.log(e) // eslint-disable-line
    // 解抵押是全部解抵押
  }

  return (
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
            <input onChange={handleInput} value={amount} />
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
  )
}

export default connect(mapStateToProps)(AcctDetail)
