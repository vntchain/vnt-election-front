import React, { useEffect, useState } from 'react'
import marked from 'marked'

import Prism from './prism'
import './prism.css'

import styles from './MdConverter.scss'
import { connect } from 'react-redux'

const mapStateToProps = ({ international: { language } }) => {
  return {
    language
  }
}
export default connect(mapStateToProps)(function MarkdownConverter(props) {
  const [mdContent, setMdContent] = useState('')
  const language = props.language

  const file =
    language === 'zh'
      ? require(`../../assets/docs/ruleDetails/ruleDetails.md`)
      : require(`../../assets/docs/ruleDetails/ruleDetails.en.md`)
  useEffect(() => {
    fetch(file)
      .then(res => {
        return res.text()
      })
      .then(text => {
        setMdContent(marked(text))
      })
  }, [language])
  useEffect(() => {
    Prism.highlightAll()
  }, [mdContent])

  return (
    <div className={styles.container}>
      <div
        className={styles.md}
        dangerouslySetInnerHTML={{ __html: mdContent }}
      />
    </div>
  )
})
