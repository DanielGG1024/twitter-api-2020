//server
const socketio = require('socket.io')

const { authenticatedSocket } = require('../middleware/auth') //TODO

let io
let userList = []

const socket = server => {
  // Set up socket.io
  io = socketio(server, {
    cors: {
      origin: [
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST'],
      transports: ['websocket', 'polling'],
      credentials: true
    },
    allowEIO3: true
  })
  console.log('Socket.io init success')

  if (!io) throw new Error('No socket io server instance')

  io.use(authenticatedSocket).on('connection', socket => {


    console.log('===== connected!!! =====')

    const { clientsCount } = io.engine
    console.log('有人加入公開聊天室，目前人數:', clientsCount)
  

    socket.on('joinPublic', (d) => {
      userList.push(socket.user)
      console.log(`${d.name} 上線`)
      console.log(userList)
      socket.broadcast.emit("announce", d)
    })

    socket.on('chatmessage', (msg) => {
      console.log('msg', msg)
      io.emit('new message', msg)
      //TODO 建立message database
    })

/*     socket.on('leavePublic',  () => {
      clientsCount-=1
      console.log("A user leaved.")
      io.emit("announce", {
        message: 'user 離線'
      })
    }) */
    socket.on('disconnect', () => {
      console

      console.log(`有人離開：目前人數:', ${clientsCount}`)


    })

  })
}

module.exports = { socket }