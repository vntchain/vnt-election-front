import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from '@translate'
import { Modal, Icon } from 'antd'

import { txSteps } from 'constants/config'

import styles from './Common.scss'

export default function TxMessageModal(props) {
  let iconType, title, message, showBody
  switch (props.step) {
    case txSteps.waitConfirm: {
      iconType = 'info-circle'
      title = 'txModalTitle1'
      message = 'txModalMessage1'
      showBody = true
      break
    }
    case txSteps.denied: {
      iconType = 'close-circle'
      title = 'txModalTitle2'
      message = 'txModalMessage2'
      showBody = true
      break
    }
    case txSteps.succeed: {
      iconType = 'check-circle'
      title = 'txModalTitle3'
      message = 'txModalMessage3'
      showBody = true
      break
    }
    case txSteps.failed: {
      iconType = 'close-circle'
      title = 'txModalTitle4'
      message = 'txModalMessage4'
      showBody = true
      break
    }
    default: {
      showBody = false
      break
    }
  }
  return (
    <Modal
      centered
      footer={null}
      closable={props.showClose || false}
      maskClosable={false}
      visible={props.visible}
      onCancel={props.onCancel}
      className={styles.txMessageModal}
    >
      {showBody && (
        <Fragment>
          <div className={styles.title}>
            <Icon type={iconType} />
            <FormattedMessage id={title} label={true} />
          </div>
          <p>
            <FormattedMessage id={message} />
          </p>
        </Fragment>
      )}
    </Modal>
  )
}

TxMessageModal.propTypes = {
  step: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  showClose: PropTypes.bool
}
