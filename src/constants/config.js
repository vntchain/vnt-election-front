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
