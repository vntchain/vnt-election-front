// 传入 '/txs' 20 ,得到 '/txs?limit=20'
export const getBasePath = (pathname, pageSize) =>
  `${pathname}?limit=${pageSize}`

// 得到 `offset=40&limit=40`
export const getBaseParams = (currentIndex, pageSize) =>
  `offset=${(currentIndex - 1) * pageSize}&limit=${pageSize}`

// 解析出url的pathname中的参数，/txs/block=1228046/2 , 得到 {2, 'block=1228046'}
export const getLocationDetail = () => {
  const arr = location.pathname.split('/').filter(t => t) // 之所以filter，是因为split得到的数组第一个元素为空
  const index = isNaN(parseInt(arr[arr.length - 1]))
    ? 1
    : parseInt(arr[arr.length - 1])
  let filterParam = ''
  if (
    (arr.length === 2 && isNaN(parseInt(arr[arr.length - 1], 10))) ||
    arr.length === 3
  ) {
    filterParam = `&${arr[1]}`
  }
  return { index, filterParam }
}

// 根据抵押的VNT计算票数
export const calcVotes = stake => {
  const deltaT = Date.now() - 1546272000000 //ms的单位
  const weeks = Math.floor(deltaT / (7 * 24 * 3600 * 1000)) / 52
  return Math.floor(stake * Math.pow(2, weeks))
}

// 123456789 => 123,456,789
export const sliceNum = num => {
  const result = []
  let str = '' + num
  while (str.length > 3) {
    result.unshift(str.slice(-3))
    str = str.slice(0, str.length - 3)
  }
  result.unshift(str)
  return result.join(',')
}

// 计算是否超过一天 true表示还在一天内
export const lessThanOneDay = oldTime => {
  return Date.now() - oldTime < 86400000
}
