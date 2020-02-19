import React, { Fragment, Component } from "react";
import { withRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { IntlProvider } from "@translate/index";
import zhMessages from "@translate/locale/zh";
import enMessages from "@translate/locale/en";
import createHistory from "history/createBrowserHistory";
import { getQueryStringParams, urlParamsToString } from "../utils/common";

import Header from "component/layout/Header";
import Margin from "component/layout/Margin";

import Home from "containers/Home";
import RuleDetail from "containers/RuleDetail";

import r from "constants/routes";
const history = createHistory();

const intlMessages = {
  zh: zhMessages,
  en: enMessages
};

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const originPush = history.push;

    const { language } = getQueryStringParams(window.location.search);

    if (language) {
      this.props.dispatch({
        type: "international/setLanguage",
        payload: language
      });
      history.push = (...args) => {
        const qs = getQueryStringParams(window.location.search);
        const path = `${args[0]}${urlParamsToString(qs)}`;
        return originPush(path, args[1]);
      };
    }
  }
  render() {
    const { language } = this.props.international;
    return (
      <IntlProvider messages={intlMessages[language]} locale={language}>
        <Fragment>
          <Header />
          <Margin size="superLarge" />
          <div>
            <Route exact path={r.home} component={Home} />
            <Route path={r.ruleDetail} component={RuleDetail} />
          </div>
          <Margin size="superLarge" />
        </Fragment>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  international: PropTypes.object
};

const mapStateToProps = ({ international }) => {
  return {
    international
  };
};

export default withRouter(connect(mapStateToProps)(App));
