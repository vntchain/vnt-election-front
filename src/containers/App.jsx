import React, { Fragment, Component } from 'react'
import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { IntlProvider } from '@translate/index'
import zhMessages from '@translate/locale/zh'
import enMessages from '@translate/locale/en'

import Header from 'component/layout/Header'
import Rule from 'component/layout/Rule'
import Margin from 'component/layout/Margin'

import Home from 'containers/Home'
import Unauthorized from 'containers/Unauthorized'
import requireAuth from 'containers/requireAuth'

import r from 'constants/routes'

const intlMessages = {
  zh: zhMessages,
  en: enMessages
}

class App extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { language } = this.props.international
    return (
      <IntlProvider messages={intlMessages[language]} locale={language}>
        <Fragment>
          <Header />
          <Margin size="superLarge" />
          <Rule />
          <Margin />
          <div>
            <Route exact path={r.home} component={requireAuth(Home)} />
            <Route path={r.unauthorized} component={Unauthorized} />
          </div>
          <Margin size="superLarge" />
        </Fragment>
      </IntlProvider>
    )
  }
}

App.propTypes = {
  international: PropTypes.object
}

const mapStateToProps = ({ international }) => {
  return {
    international
  }
}

export default withRouter(connect(mapStateToProps)(App))
