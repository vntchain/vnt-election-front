import React, { Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Popover from '@material-ui/core/Popover'
import styles from './LanguageSelect.scss'
import { getQueryStringParams, urlParamsToString } from '../../utils/common'

const getTargetTitle = (arr, target) => {
  const result = arr.find(item => item.value === target)
  return result.title
}

class LangSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      visible: false
    }
  }

  handlePopoverOpen = e => {
    this.setState({ anchorEl: e.currentTarget, visible: true })
  }

  handlePopoverClose = () => {
    this.setState({ anchorEl: null, visible: false })
  }

  handleChangeLang = e => {
    const selectedLangValue = e.target.dataset.value
    const { language } = this.props.international
    if (selectedLangValue && language !== selectedLangValue) {
      this.props.dispatch({
        type: 'international/setLanguage',
        payload: selectedLangValue
      })
      if (window.location.pathname === '/') {
        this.props.dispatch({
          type: 'international/getLanguage',
          payload: {
            language: selectedLangValue === 'en' ? 'EN' : 'CN'
          }
        })
      }

      const qs = getQueryStringParams(window.location.search)
      qs.language = selectedLangValue
      const searchStr = urlParamsToString(qs)

      this.props.history.replace(`${window.location.pathname}${searchStr}`)
    }
    this.handlePopoverClose()
  }

  render() {
    const dataSrc = {
      title: '中文',
      value: 'zh',
      key: 'lang',
      children: [
        { title: '中文', value: 'zh', key: 'zh' },
        { title: 'English', value: 'en', key: 'en' }
      ]
    }
    const { anchorEl, visible } = this.state
    const { language } = this.props.international
    return (
      <Fragment>
        <div
          className={`${styles['nav-item']} ${styles['lang-select']}`}
          onClick={this.handlePopoverOpen}
        >
          {dataSrc.children ? (
            <Fragment>
              {getTargetTitle(dataSrc.children, language)}
              <span
                className={
                  visible
                    ? `${styles['nav-arrow']} ${styles['nav-arrow-up']}`
                    : styles['nav-arrow']
                }
              />
            </Fragment>
          ) : (
            dataSrc.title
          )}
        </div>
        <Popover
          open={visible}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          onClose={this.handlePopoverClose}
        >
          <div
            className={styles['popover-list']}
            onClick={this.handleChangeLang}
          >
            {dataSrc.children.map(child => {
              return (
                <div
                  className={`${styles['popover-list-item']} ${styles['lang-item']}`}
                  key={child.key}
                  data-value={child.value}
                >
                  {child.title}
                </div>
              )
            })}
          </div>
        </Popover>
      </Fragment>
    )
  }
}

function mapStateToProps({ international }) {
  return { international }
}

export default connect(mapStateToProps)(withRouter(LangSelect))
