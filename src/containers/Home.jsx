import React from 'react'
import { connect } from 'react-redux'
import Authorized from 'component/home/Authorized'
import Unauthorized from 'component/home/Unauthorized'
import CommonPadding from 'component/layout/CommonPadding'
import Margin from 'component/layout/Margin'
import Rule from 'component/home/Rule'
import { walletState } from 'constants/config'
import VoteDetailProvider from 'component/authorized/VoteDetailProvider'
import NodeList from 'component/home/NodeList'

const mapStateToProps = ({ auth: { authStatus } }) => {
  return {
    authStatus
  }
}

function Home(props) {
  console.log(props) //eslint-disable-line
  return (
    <CommonPadding>
      <Rule />
      <Margin />
      {props.authStatus === walletState.authorized ? (
        <Authorized />
      ) : (
        <Unauthorized />
      )}
      <Margin />
      <VoteDetailProvider render={data => <NodeList voteDetail={data} />} />
    </CommonPadding>
  )
}

export default connect(mapStateToProps)(Home)
