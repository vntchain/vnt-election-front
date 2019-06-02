import { connect } from 'react-redux'
import { walletState } from 'constants/config'
import { useEffect } from 'react'

function DetectAuth(props) {
  if (typeof window.vnt === 'undefined') {
    // 未检测到钱包插件，此时状态变为 uninstalled
    props.dispatch({
      type: 'auth/setAuthStatus',
      payload: walletState.authorized //uninstalled authorized
    })
  }

  useEffect(() => {
    if (typeof window.vnt !== 'undefined') {
      // 检测到钱包插件，此时需要调用接口去查询是否授权, 若是已授权, 则查询coinbase拿到地址
    }
  }, [])

  return props.children
}

export default connect()(DetectAuth)
