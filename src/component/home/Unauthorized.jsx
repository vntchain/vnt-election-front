import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from '@translate'
import { Icon, Tooltip, message } from 'antd'

import MessageConfirm from 'component/MessageConfirm'
import { walletState, netConfig } from 'constants/config'

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

  const checkNetwork = () => {
    window.vnt.getNetworkUrl((err, result) => {
      // 需要判断result的值，同时修改nodeslist的后端接口，此时无法直接刷新页面，需要仅内部页面刷新 
      if (!err && result) {
        // console.warn(`network_change: err= ${err}, result=${JSON.stringify(result)}`) //eslint-disable-line
        props.dispatch({
          type: 'fetchRPCData/setState',
          payload: {
            rpc: result.url, //window.vnt.currentProvider.host,
            chainId: result.chainId //window.vnt.version.network 需要先授权才能取到，不然会报错
          }
        })
        if (result.chainId == 2) {
          props.dispatch({
            type: 'dataRelayNew/setState',
            payload: {
              nodesAxiosBaseUrl: netConfig.testnet.nodesURL,
              nodeAddrBaseurl: netConfig.testnet.nodeAddr
            }
          })
        } else if (result.chainId == 1) {
          props.dispatch({
            type: 'dataRelayNew/setState',
            payload: {
              nodesAxiosBaseUrl: netConfig.mainnet.nodesURL,
              nodeAddrBaseurl: netConfig.mainnet.nodeAddr
            }
          })
        }
      }
    })
  }

  const getAuth = () => {
    window.vnt.requestAuthorization(function(err, authorized) {
      if (authorized === true) {
        // 已经授权 去拿账号
        try {
          window.vnt.core.getCoinbase((err, acct) => {
            //console.log('获取账户： err=',err,'acct=',acct) // eslint-disable-line
            if (!err) {
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
            } else {
              message.error(err)
            }
          })
        } catch (e) {
          message.error(e.message)
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
        // checkNetwork()
        try {
          getAuth()
        } catch (e) {
          message.error(e.message) 
        }
      } else {
        // 未安装插件
        setShow(true)
      }
    } else {
      //若状态是已安装插件未授权
      try {
        getAuth()
      } catch (e) {
        message.error(e.message)
      }
    }
  }

  useEffect(() => {
    if (typeof window.vnt === 'undefined') {
      //console.log('未检测到钱包插件') // eslint-disable-line
    } else {
      checkNetwork()
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
