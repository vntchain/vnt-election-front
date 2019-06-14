import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from '@translate'
import { Icon, Tooltip } from 'antd'

import MessageConfirm from 'component/MessageConfirm'
import { walletState } from 'constants/config'

import styles from './Unauthorized.scss'

const mapStateToProps = ({ auth: { authStatus } }) => {
  return {
    authStatus
  }
}

function Unauthorized(props) {
  const [show, setShow] = useState(false)
  const loginTooltip = (
    <div className={styles.tooltip}>
      <FormattedMessage id="login2" />
    </div>
  )

  const startApp = () => {
    window.vnt.requesetAuthorization(function(err, authorized) {
      if (authorized === true) {
        // 已经授权 去拿账号
        try {
          window.vnt.core.getCoinbase((err, acct) => {
            // 获取账户详情的回调被调用了 返回始终是 { err: null， acct: ''/'0x....'}
            props.dispatch({
              type: 'account/setAccountAddr',
              payload: {
                err: null,
                addr: acct.trim() ? acct.trim() : null
              }
            })
            props.dispatch({
              type: 'auth/setAuthStatus',
              payload: acct.trim()
                ? walletState.authorized
                : walletState.unauthorized
            })
          })
        } catch (e) {
          console.log(e.message) // eslint-disable-line
          throw new Error(e)
        }
      } else {
        // 没有授权 状态设置为已登录 未授权
        props.dispatch({
          type: 'auth/setAuthStatus',
          payload: walletState.unauthorized //uninstalled authorized
        })
      }
    })
  }

  const handleClick = () => {
    if (props.authStatus === walletState.uninstalled) {
      // 未安装，点击时则会再次去检测
      if (typeof window.vnt !== 'undefined') {
        props.dispatch({
          type: 'fetchRPCData/setRpc',
          payload: window.vnt.currentProvider.host
        })
        console.log('点击请求授权') //eslint-disable-line
        try {
          startApp()
        } catch (e) {
          console.log(e.message) //eslint-disable-line
        }
      } else {
        // 未安装插件
        setShow(true)
      }
    } else {
      //若状态是已安装插件未授权
      try {
        startApp()
      } catch (e) {
        throw new Error(e.message) //eslint-disable-line
      }
    }
  }

  useEffect(() => {
    if (window.setupWalletBridge) {
      window.initWalletBridge = function() {
        console.log(window.vnt) //eslint-disable-line
        props.dispatch({
          type: 'fetchRPCData/setRpc',
          payload: window.vnt.currentProvider.host
        })
        startApp()
      }
    } else if (typeof window.vnt === 'undefined') {
      console.log('未检测到钱包插件') // eslint-disable-line
    } else {
      props.dispatch({
        type: 'fetchRPCData/setRpc',
        payload: window.vnt.currentProvider.host
      })
      try {
        startApp()
      } catch (e) {
        throw new Error(e.message) //eslint-disable-line
      }
    }
  }, [])

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
      <MessageConfirm
        id="login3"
        visible={show}
        onCancel={() => setShow(false)}
      />
    </Fragment>
  )
}

export default connect(mapStateToProps)(Unauthorized)
