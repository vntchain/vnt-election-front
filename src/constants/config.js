export const pollingInterval = 60 // 60 seconds
export const pageSize = 40

export const maximumVoteNum = 30

export const forbiddenActionTime = 86400000 //  86400000 24h 600000 10min 180000 3min
export const requestTxLimitTime = 10000 // 10s

export const netConfig = {
  mainnet: {
    nodesURL:
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_MAINNET_DEV_API
        : process.env.REACT_APP_MAINNET_PROD_API,
    nodeAddr:
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_MAINNET_DEV_URL
        : process.env.REACT_APP_MAINNET_PROD_URL
  },
  testnet: {
    // 浏览器后端接口，取超级节点数据
    nodesURL:
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_TESTNET_DEV_API
        : process.env.REACT_APP_TESTNET_PROD_API,
    //表格中点击节点名称跳转地址的baseurl
    nodeAddr:
      process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_TESTNET_DEV_URL
        : process.env.REACT_APP_TESTNET_PROD_URL
  }
}

//console.log(netConfig) //eslint-disable-line

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
  stake: '$stake',
  unStake: 'unStake',
  setProxy: 'setProxy', //设置委托人
  cancelProxy: 'cancelProxy', // 取消委托
  startProxy: 'startProxy', //开启代理
  stopProxy: 'stopProxy', //关闭代理
  vote: 'voteWitnesses', //投票
  cancelVote: 'cancelVote' // 取消投票
}
