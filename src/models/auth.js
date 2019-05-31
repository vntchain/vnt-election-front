import { walletState } from 'constants/config'
export default {
  state: {
    authStatus: walletState.uninstalled,
    accountAddr: '',
    proxyAddr: ''
  }
}
