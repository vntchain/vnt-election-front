import React, { useState } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from '@translate'
import { Tooltip } from 'antd'
import { format } from 'date-fns'

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
    balance && balance.data ? parseInt(balance.data) / Math.pow(10, 18) : '-'
  const voteDetail =
    myVotes &&
    myVotes.data &&
    myVotes.data.proxy &&
    parseInt(myVotes.data.proxy)
      ? proxiedVotes
      : myVotes

  const details = {
    balance: balanceDecimal,
    stake: (stake && stake.data && stake.data.stakeCount) || '-',
    votes:
      (voteDetail && voteDetail.data && voteDetail.data.lastVoteCount) || '-',
    useProxy:
      myVotes &&
      myVotes.data &&
      myVotes.data.proxy &&
      parseInt(myVotes.data.proxy)
        ? true
        : false,
    voteTime:
      voteDetail && voteDetail.data && voteDetail.data.lastVoteTimeStamp
        ? format(
            new Date(voteDetail.data.lastVoteTimeStamp * 1000),
            'YYYY/MM/DD'
          )
        : '-'
  }

  const [showEstimation, setShowEstimation] = useState(true)
  const [estimatedVotes, setEstimatedVotes] = useState(0)

  const handleInput = e => {
    console.log(e.target.value) // eslint-disable-line
    setShowEstimation(true)
    setEstimatedVotes(1)
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
            {` (${details.voteTime})`}
          </h5>
          <img alt="" src={require('@images/detail/3.png')} />
        </li>
      </ul>
      <ul className={styles.wrap}>
        <li className={`${styles['item']} ${styles['item2']}`}>
          <div>
            <div>
              <FormattedMessage id="htitle2" />
              {showEstimation && (
                <span>
                  <FormattedMessage id="htitle4" />
                  {estimatedVotes}
                </span>
              )}
            </div>
            <input onChange={handleInput} />
          </div>
          <button>
            <FormattedMessage id="htitle13" />
          </button>
        </li>
        <li className={`${styles['item']} ${styles['item2']}`}>
          <FormattedMessage id="htitle5" />
        </li>
      </ul>
    </div>
  )
}

export default connect(mapStateToProps)(AcctDetail)
