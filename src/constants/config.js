export const pollingInterval = 100
export const pageSize = 40

export const rpc = 'http://47.102.157.204:8880'
export const chainId = 2

export const maximumVoteNum = 30

export const forbiddenActionTime = 86400000 //  86400000 24h 600000 10min
export const requestTxLimitTime = 10000 // 10s

export const netConfig = {
  mainnet: {
    nodesURL: 'http://192.168.9.99:8080/v1',
    rpcURL: 'http://47.102.157.204:8880',
    nodeAddr: '//hubscan.vnt.link/account/'
  },
  testnet: {
    nodesURL: 'http://192.168.9.99:8080/v1',
    rpcURL: 'http://47.102.157.204:8880',
    nodeAddr: '//hubscan.vnt.link/account/'
  }
}

export const walletState = {
  uninstalled: 'uninstalled',
  unauthorized: 'unauthorized',
  authorized: 'authorized'
}

export const txSteps = {
  waitConfirm: 'waitConfirmTx',
  denied: 'cancelledTx',
  succeed: 'sendTxSuccess',
  failed: 'sendTxFailed',
  query: 'queryTxResult',
  txSuccess: 'txSuccess',
  txFailed: 'txFailed',
  txTimeout: 'txTimeout'
}

export const txActions = {
  stake: 'stake',
  unStake: 'unStake',
  setProxy: 'setProxy', //设置委托人
  cancelProxy: 'cancelProxy', // 取消委托
  startProxy: 'startProxy', //开启代理
  stopProxy: 'stopProxy', //关闭代理
  vote: 'voteWitnesses', //投票
  cancelVote: 'cancelVote' // 取消投票
}
