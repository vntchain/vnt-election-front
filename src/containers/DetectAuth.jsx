import { connect } from 'react-redux'
import { walletState } from 'constants/config'
import { useEffect } from 'react'

function DetectAuth(props) {
  if (window.setupWalletBridge) {
    window.initWalletBridge = function() {
      //请求钱包授权
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
  } else if (typeof window.vnt === 'undefined') {
    // 未检测到钱包插件，此时状态变为 uninstalled
    console.log('未检测到钱包插件') // eslint-disable-line
    if (sessionStorage.getItem('rpc')) {
      sessionStorage.removeItem('rpc')
    }
    // props.dispatch({
    //   type: 'auth/setAuthStatus',
    //   payload: walletState.uninstalled
    // })
  }

  useEffect(() => {
    if (typeof window.vnt !== 'undefined') {
      // 设置rpc节点信息
      sessionStorage.setItem('rpc', window.vnt.currentProvider.host)
      // 检测到钱包插件，此时需要调用接口去查询是否授权, 若是已授权, 则查询coinbase拿到地址
      try {
        window.vnt.requesetAuthorization(function(err, authorized) {
          console.log('请求授权返回结果',err,authorized) // eslint-disable-line
          if (authorized === true) {
            // 已经授权 去拿账号
            props.dispatch({
              type: 'account/getAcctAddr'
            })
          } else {
            // 没有授权 状态设置为已登录 未授权
            props.dispatch({
              type: 'auth/setAuthStatus',
              payload: walletState.unauthorized //uninstalled authorized
            })
          }
        })
      } catch (e) {
        console.log(e.message) //eslint-disable-line
      }
    }
  }, [])

  return props.children
}

export default connect()(DetectAuth)
