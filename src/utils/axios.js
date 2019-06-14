import axios from 'axios'

export default axios.create({
  timeout: 30000
})

export const rpcInstance = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})
