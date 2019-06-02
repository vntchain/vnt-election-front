import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from '@translate'

import { Icon } from 'antd'

import styles from './Authorized.scss'

const mapStateToProps = ({ account: { accountAddr } }) => {
  return {
    accountAddr
  }
}

export default connect(mapStateToProps)(function(props) {
  return (
    <div className={styles.acct}>
      <Icon type="wallet" />
      <FormattedMessage id="acctText" />
      {props.accountAddr && props.accountAddr.addr}
    </div>
  )
})
