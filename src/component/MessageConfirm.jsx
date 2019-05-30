import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from '@translate'
import { Modal } from 'antd'

import styles from './MessageConfirm.scss'

export default function MessageConfirm(props) {
  return (
    <Modal
      centered
      mask={false}
      footer={null}
      visible={props.visible}
      onCancel={props.onCancel}
      className={styles.modal}
    >
      <FormattedMessage id={props.id} />
    </Modal>
  )
}

MessageConfirm.propTypes = {
  id: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired
}
