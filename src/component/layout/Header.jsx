import React from 'react'
import { FormattedMessage } from '@translate'
import CommonPadding from './CommonPadding'

import styles from './Header.scss'
import imgs from 'utils/imgs'
import LanguageSelect from './LanguageSelect'
function Header() {
  return (
    <header className={styles.header}>
      <CommonPadding>
        <div className={styles.headerCont}>
          <LanguageSelect></LanguageSelect>

          <img src={imgs.logo} alt="logo" className={styles.headerLogo} />
          <img
            src={imgs.headerPic}
            alt="headerPic"
            className={styles.headerPic}
          />
          <div className={styles.headerText}>
            <FormattedMessage id="headerText" />
          </div>
        </div>
      </CommonPadding>
    </header>
  )
}

export default Header
