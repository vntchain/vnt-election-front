import React, { useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import TxMessageModal from 'component/TxMessageModal'
import { txSteps } from 'constants/config'

const mapStateToProps = ({ account: { sendResult } }) => {
  return {
    sendResult
  }
}

function ProvideModalData(props) {
  const { sendResult } = props

  const [showTxModal, setShowTxModal] = useState(false)

  useEffect(
    () => {
      setShowTxModal(sendResult && sendResult.step ? true : false)
    },
    [sendResult]
  )

  const clearResult = () => {
    setShowTxModal(false)
    props.dispatch({
      type: 'account/setSendResult',
      payload: null
    })
  }

  return (
    <Fragment>
      {sendResult && (
        <TxMessageModal
          visible={showTxModal}
          step={(sendResult && sendResult.step) || txSteps.waitConfirm}
          showClose={
            sendResult &&
            sendResult.step &&
            (sendResult.step === txSteps.txSuccess ||
              sendResult.step === txSteps.txFailed ||
              sendResult.step === txSteps.denied)
          }
          onCancel={clearResult}
        />
      )}
    </Fragment>
  )
}

export default connect(mapStateToProps)(ProvideModalData)
