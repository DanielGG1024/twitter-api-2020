'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 1,
          account: 'admin',
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          name: 'root',
          avatar: `https://i.pravatar.cc/150?u=${Math.ceil(Math.random()) * 10
            }`,
          cover: `https://loremflickr.com/600/240/landscape/?random=${Math.random() * 100
            }`,
          introduction: faker.lorem.sentence().substring(0, 160),
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
    await queryInterface.bulkInsert(
      'users',
      ['user1', 'user2', 'user3', 'user4', 'user5'].map((user, index) => ({
        id: (index + 1) * 10 + 1,
        account: user,
        email: `${user}@example.com`,
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        name: user,
        avatar: `https://i.pravatar.cc/150?u=${Math.ceil(Math.random()) * 10}`,
        cover: `https://loremflickr.com/600/240/landscape/?random=${Math.random() * 100
          }`,
        introduction: faker.lorem.sentence().substring(0, 160),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
