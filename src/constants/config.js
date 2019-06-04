export const pollingInterval = 100
export const pageSize = 40

export const rpc = 'http://47.102.157.204:8880'
export const chainId = 2

export const walletState = {
  uninstalled: 'uninstalled',
  unauthorized: 'unauthorized',
  authorized: 'authorized'
}

export const txSteps = {
  waitConfirm: 'waitConfirmTx',
  denied: 'cancelledTx',
  succeed: 'successfulTx',
  failed: 'failedTx'
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
