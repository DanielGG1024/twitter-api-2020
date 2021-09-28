const { Chat, Sequelize, User, Room, Member } = require('../models')

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
        order: [['createdAt', 'ASC']],
        raw: true,
        nest: true
      })
      return res.status(200).json(chat)
    } catch (err) {
      next(err)
    }
  },
  createRoom: async (UserId1, UserId2) => {
    try {
      //exist?
      //TODO if UserId1===UserId2
      const roomData = await Room.findOne({
        where: {
          [Op.or]: [
            { UserId1, UserId2 },
            { UserId1: UserId2, UserId2: UserId1 }
          ]
        }
      })
      if (roomData) return roomData

      //if not exist
      return await Room.create({
        UserId1, UserId2
      })
    } catch (err) { console.log(err) }
  },
  getPrivateChatMember: async (req, res, next) => {
    try {
      const { userId } = req.params
      const data = await Room.findAll({
        attributes: [['id', 'RoomId'], 'UserId1', 'UserId2',
        [Sequelize.literal('(SELECT text FROM Chats WHERE Chats.RoomId = Room.id order by Chats.createdAt DESC LIMIT 1)'), 'text'
        ],
        [Sequelize.literal('(SELECT createdAt FROM Chats WHERE Chats.RoomId = Room.id order by Chats.createdAt DESC LIMIT 1)'), 'createdAt'
        ]],
        where: {
          [Op.or]: { UserId1: userId, UserId2: userId },
        },
        include: [{
          model: Member,
          where: { UserId: { [Op.not]: userId } },
          attributes: ['UserId'],
          include: [{
            model: User,
            attributes: ['id', 'name', 'account', 'avatar'],
          }]
        }],
        order: [[[Sequelize.literal('createdAt'), 'DESC']],],
        nest: true,
        raw: true
      })
      console.log('----data---')
      console.log(data)
      const privateChatMemberData = data.map(i => ({
        roomId: i.RoomId,
        userId: userId,
        text: i.text,
        createdAt: i.createdAt,
        chatMemberData: i.Members.User,
      }))
      console.log('-----------privateMember-------')
      console.log(privateChatMemberData)

      return res.render('private', { privateChatMemberData, userId })
      return res.status(200).json(privateChatMemberData)
    } catch (err) {
      console.log(err)
    }
  },
  getPrivateHistoryMsg: async (req, res, next) => {
    const { roomId } = req.params
    const { userId } = req.body //之後前端用登入者取得
    try {//TODO感覺要串member
      const chat = await Chat.findAll({
        where: { roomId },
        attributes: [
          ['id', 'ChatId'], 'createdAt', 'text', 'RoomId'
        ],
        include: [
          {
            model: User, attributes: ['id', 'name', 'avatar', 'account'],
            where: { role: { [Op.not]: 'admin' } }
          },
        ],
        order: [['createdAt', 'ASC']],
        raw: true,
        nest: true
      })
      console.log(chat)
      // return res.render('privateRoom', { chat, roomId, userId })
      return res.status(200).json(chat)
    } catch (err) {
      next(err)
    }
  },

}

module.exports = chatroomController