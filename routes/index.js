const users = require('./apis/users')
const admin = require('./apis/admin')
const tweets = require('./apis/tweets')
const followships = require('./apis/followships')
const chatroom = require('./apis/chatroom')



module.exports = app => {
  app.use('/api/users',  users)
  app.use('/api/admin',  admin)
  app.use('/api/tweets', tweets)
  app.use('/api/followships',  followships)
  app.use('/api/chatroom',  chatroom)

}