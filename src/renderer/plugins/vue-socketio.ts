import Vue3SocketIO from '@hlf01/vue3-socket.io'
import SocketIO from 'socket.io-client'

export default new Vue3SocketIO({
  debug: true,
  connection: SocketIO('http://10.1.188.64:8082', {
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5
  })
})
