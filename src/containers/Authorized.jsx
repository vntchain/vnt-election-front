import React, { Fragment } from 'react'
import AcctAddr from 'component/authorized/AcctAddr'
import AcctDetail from 'component/authorized/AcctDetail'
import Margin from 'component/layout/Margin'

function Authorized() {
  return (
    <Fragment>
      <AcctAddr />
      <Margin />
      <AcctDetail />
    </Fragment>
  )
}

export default Authorized
