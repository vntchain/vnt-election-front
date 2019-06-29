import { forbiddenActionTime } from 'constants/config'

// 传入 '/txs' 20 ,得到 '/txs?limit=20'
export const getBasePath = (pathname, pageSize) =>
  `${pathname}?limit=${pageSize}`

// 得到 `offset=40&limit=40`
export const getBaseParams = (currentIndex, pageSize) =>
  `offset=${(currentIndex - 1) * pageSize}&limit=${pageSize}`

// 解析出url的pathname中的参数，/txs/block=1228046/2 , 得到 {2, 'block=1228046'}
export const getLocationDetail = () => {
  const arr = location.pathname.split('/').filter(t => t) // 之所以filter，是因为split得到的数组第一个元素为空
  const index = isNaN(parseInt(arr[arr.length - 1], 10))
    ? 1
    : parseInt(arr[arr.length - 1], 10)
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
  return Date.now() - oldTime < forbiddenActionTime
}

export const formatTime = (s, formatStyle) => {
  //console.log(s) //eslint-disable-line
  let result = ''
  switch (formatStyle) {
    case 'HH:mm:ss': {
      let hour = '' + Math.floor(s / 3600)
      let min = '' + Math.floor((s / 60) % 60)
      let sec = '' + Math.floor(s % 60)
      hour = hour.length === 1 ? '0' + hour : hour
      min = min.length === 1 ? '0' + min : min
      sec = sec.length === 1 ? '0' + sec : sec
      result = `${hour}:${min}:${sec}`
      break
    }
    case 's': {
      const sec = Math.floor(s / 1000)
      result = `${sec}`
      break
    }
    default:
      break
  }
  return result
}

export const setPrecision = (num, precision) => {
  const ratio = Math.pow(10, precision)
  return Math.round(num * ratio) / ratio
}
