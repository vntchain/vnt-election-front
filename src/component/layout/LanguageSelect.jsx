import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import styles from './LanguageSelect.scss'
import { getQueryStringParams, urlParamsToString } from '../../utils/common'
import { Menu, Dropdown } from 'antd'
const getTargetTitle = (arr, target) => {
  const result = arr.find(item => item.value === target)
  return result.title
}
const dataSrc = [
  { title: '中文', value: 'zh', key: 'zh' },
  { title: 'English', value: 'en', key: 'en' }
]

class LangSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }

  handleVisibleChange = () => {
    this.setState({ visible: !this.state.visible })
  }

  handleChangeLang = e => {
    const selectedLangValue = e.target.dataset.value
    const { language } = this.props.international
    if (selectedLangValue && language !== selectedLangValue) {
      this.props.dispatch({
        type: 'international/setLanguage',
        payload: selectedLangValue
      })

      const qs = getQueryStringParams(window.location.search)
      qs.language = selectedLangValue
      const searchStr = urlParamsToString(qs)

      this.props.history.replace(`${window.location.pathname}${searchStr}`)
    }
    this.handleVisibleChange()
  }

  render() {
    const { visible } = this.state
    const { language } = this.props.international
    return (
      <Fragment>
        <Dropdown
          className={`${styles['nav-item']} ${styles['lang-select']}`}
          visible={visible}
          onVisibleChange={this.handleVisibleChange}
          trigger={['click']}
          overlay={
            <Menu>
              {dataSrc.map(child => {
                return (
                  <div
                    className={`${styles['popover-list-item']} ${styles['lang-item']}`}
                    key={child.key}
                    data-value={child.value}
                    onClick={this.handleChangeLang}
                  >
                    {child.title}
                  </div>
                )
              })}
            </Menu>
          }
        >
          <div>
            {getTargetTitle(dataSrc, language)}
            <span
              className={
                visible
                  ? `${styles['nav-arrow']} ${styles['nav-arrow-up']}`
                  : styles['nav-arrow']
              }
            />
          </div>
        </Dropdown>
      </Fragment>
    )
  }
}

function mapStateToProps({ international }) {
  return { international }
}

export default connect(mapStateToProps)(withRouter(LangSelect))
