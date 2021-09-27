'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn( 'Chats', 'RoomId', {
      type: Sequelize.STRING
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn( 'Chats', 'RoomId' );
  }
};