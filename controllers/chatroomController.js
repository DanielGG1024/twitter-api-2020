const { Chat, Sequelize, User, Room, Member} = require('../models')
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
  getPrivateChatMember: async (req, res, next) => {
    try{
      const { userId } = req.params
      roomOption = {
        attributes:['RoomId'],
        where: { [Op.or]: [{ UserId1: userId, UserId2: userId }] },
        include: [
          { 
            model: User, 
            attributes: ['id', 'name', 'avatar', 'account'], 
          }
        ]
      }
      const privateChatMemberData = await Room.findByPk(userId, roomOption)
      return res.status(200).json(privateChatMemberData)
    }catch(err) {
      console.log(err)
    }
  },
  getPrivateHistoryMsg: async (req, res, next) => {
    const { roomId } = req.params
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
      const chat = await Chat.findByPk(roomId, roomOption)
      return res.status(200).json(chat)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = chatroomController