const { Chat, Sequelize, User } = require('../models')
const { Op } = Sequelize

let chatroomController = {
  postChat: async (user, msg, roomId) => {
    try {
      return await Chat.create({
        UserId: user.id,
        text: msg,
        RoomId: roomId,
      })
    } catch (err) { console.log(err) }
  },
  getHistoryMsg: async (req, res, next) => {
    try {
      const chat = await Chat.findAll({
        attributes: [
          ['id', 'ChatId'], 'createdAt', 'text', 'roomId'
        ],
        include: [
          {
            model: User, attributes: ['id', 'name', 'avatar', 'account'],
            where: { role: { [Op.not]: 'admin' } }
          }],
        raw: true,
        nest: true
      })
      return res.status(200).json(chat)
    } catch (err) {
      next(err)
    }
  },
  createRoom: async (UserId1, UserId2) => {
    try{
      //exist?
      const roomData = await Room.findOne({
        where: {
          [Op.or]: [
            {UserId1,UserId2},
            {UserId1: UserId2, UserId2: UserId1}
          ]
        }
      })
      if(roomData) return roomData

      //if not exist
      return await Room.create({
        UserId1,UserId2
      })
    }catch (err) { console.log(err) }
  },
  getPrivateHistoryMsg: async (req, res, next) => {
    const { roomId } = req.params
    let chat 
    const roomOption = {
        attributes: [
          ['id', 'ChatId'], 'createdAt', 'text'
        ],
        include: [
          {
            model: User, attributes: ['id', 'name', 'avatar', 'account'],
            where: { role: { [Op.not]: 'admin' } }
          }],
        raw: true,
        nest: true
      }
    try {
      if(roomId) chat = await Chat.findByPk(roomId, roomOption)
      else chat = await Chat.findAll(roomOption)
      return res.status(200).json(chat)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = chatroomController