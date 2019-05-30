import React from 'react'
import { FormattedMessage } from '@translate'
import CommonPadding from './CommonPadding'
import styles from './Rule.scss'

export default function Rule() {
  return (
    <CommonPadding>
      <div className={styles.rule}>
        <div className={styles.ruleTitle}>
          <span>•&nbsp;</span>
          <FormattedMessage id="ruleTitle" />
          <span>&nbsp;•</span>
        </div>
        <div className={styles.ruleContent}>
          <p>
            <span>•&nbsp;</span>
            <FormattedMessage id="rule1" />
          </p>
          <p>
            <span>•&nbsp;</span>
            <FormattedMessage id="rule2" />
          </p>
          <p>
            <span>•&nbsp;</span>
            <FormattedMessage id="rule3" />
          </p>
          <p>
            <span>•&nbsp;</span>
            <FormattedMessage id="rule4" />
          </p>
        </div>
      </div>
    </CommonPadding>
  )
}
