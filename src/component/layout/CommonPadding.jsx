import React from 'react'

import styles from './CommonPadding.scss'

const CommonPadding = props => {
  // eslint-disable-next-line react/prop-types
  return <div className={styles.container}>{props.children}</div>
}

export default CommonPadding
