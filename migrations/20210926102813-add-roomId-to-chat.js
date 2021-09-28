'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Chats', 'RoomId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'RoomId',
        key: 'id'
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Chats', 'RoomId')
  }
}