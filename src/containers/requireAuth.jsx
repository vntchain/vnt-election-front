import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import r from 'constants/routes'

function requireAuth(WrappedComponent) {
  const mapStateToProps = ({ auth }) => {
    return {
      auth
    }
  }
  return connect(mapStateToProps)(function(props) {
    // 在此处检测是否有登录，即调用钱包插件提供的api检测,检测到已授权了则需要取地址
    if (!props.auth.authStatus) {
      props.dispatch(push(r.unauthorized))
    }
    return props.auth.authStatus ? <WrappedComponent /> : null
  })
}

export default requireAuth
