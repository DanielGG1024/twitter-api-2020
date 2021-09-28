const users = require('./apis/users')
const admin = require('./apis/admin')
const tweets = require('./apis/tweets')
const followships = require('./apis/followships')
const chatroom = require('./apis/chatroom')
const userController = require('../controllers/userController')
const chatroomController = require('../controllers/chatroomController')



module.exports = app => {
  app.use('/api/users', users)
  app.use('/api/admin', admin)
  app.use('/api/tweets', tweets)
  app.use('/api/followships', followships)
  app.use('/api/chatroom', chatroom)

  app.get('/', (req, res) => { res.render('index') })
  app.get('/login', (req, res) => { res.render('login') })
  app.get('/private/:userId', chatroomController.getPrivateChatMember)
  app.post('/room/:roomId', chatroomController.getPrivateHistoryMsg)
  app.post('/private', userController.LoginPrivate)
  app.post('/', userController.Login)

}