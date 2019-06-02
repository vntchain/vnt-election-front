import React from 'react'
import { connect } from 'react-redux'
import Authorized from 'containers/Authorized'
import Unauthorized from 'containers/Unauthorized'
import CommonPadding from 'component/layout/CommonPadding'
import Margin from 'component/layout/Margin'
import Rule from 'component/layout/Rule'
import { walletState } from 'constants/config'

const mapStateToProps = ({ auth: { authStatus } }) => {
  return {
    authStatus
  }
}

function Home(props) {
  return (
    <CommonPadding>
      <Rule />
      <Margin />
      {props.authStatus === walletState.authorized ? (
        <Authorized />
      ) : (
        <Unauthorized />
      )}
    </CommonPadding>
  )
}

export default connect(mapStateToProps)(Home)
