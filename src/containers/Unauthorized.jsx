import React, { useState, Fragment } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from '@translate'
import { Icon, Tooltip } from 'antd'

import MessageConfirm from 'component/MessageConfirm'
import Margin from 'component/layout/Margin'
import DataRenew from 'component/unauthorized/DataRenew'

import { getLocationDetail } from 'utils/tools'
import { walletState } from 'constants/config'

import styles from './Unauthorized.scss'

const mapStateToProps = ({ auth: { authStatus } }) => {
  return {
    authStatus
  }
}

function Unauthorized(props) {
  const [show, setShow] = useState(false)
  const { index, filterParam } = getLocationDetail()
  const loginTooltip = (
    <div className={styles.tooltip}>
      <FormattedMessage id="login2" />
    </div>
  )

  const handleClick = e => {
    console.log(e.target) //eslint-disable-line
    console.log(e.currentTarget) //eslint-disable-line
    // 在此处拿到钱包插件的状态,检测状态是未安装插件，则需要渲染Modal框，提示去google商店安装
    if (props.authStatus === walletState.uninstalled) {
      setShow(true)
    } else {
      //若状态是已安装插件未授权，则点击后会调用钱包的登录界面去获取授权
      window.vnt.requesetAuthorization(function(err, authorized) {
        if (authorized === true) {
          // 已经授权 去拿账号
          props.dispatch({
            type: 'account/getAcctAddr',
            payload: walletState.authorized
          })
        } else {
          // 没有授权 状态设置为已登录 未授权
          props.dispatch({
            type: 'auth/setAuthStatus',
            payload: walletState.unauthorized //uninstalled authorized
          })
        }
      })
    }
  }

  return (
    <Fragment>
      <div className={styles.loginHint}>
        <span className={styles.button} onClick={handleClick}>
          <FormattedMessage id="login1" />
          <Tooltip title={loginTooltip} placement="bottomRight">
            <Icon type="question-circle" theme="filled" />
          </Tooltip>
        </span>
      </div>
      <Margin />
      <div className={styles.nodesTable}>
        <DataRenew locationIndex={index} filterParam={filterParam} />
      </div>
      <MessageConfirm
        id="login3"
        visible={show}
        onCancel={() => setShow(false)}
      />
    </Fragment>
  )
}

export default connect(mapStateToProps)(Unauthorized)
