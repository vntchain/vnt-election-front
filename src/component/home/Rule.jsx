import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { FormattedMessage } from '@translate'
import styles from './Rule.scss'
import r from 'constants/routes'
const mapStateToProps = ({ international: { language } }) => {
  return {
    language
  }
}
export default connect(mapStateToProps)(function Rule(props) {
  const language = props.language

  return (
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
      <div className={styles.ruleMore}>
        <Link to={`${r.ruleDetail}?language=${language}`} target="__blank">
          <FormattedMessage id="rule5" />
        </Link>
      </div>
    </div>
  )
})
