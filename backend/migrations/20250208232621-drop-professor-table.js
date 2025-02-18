'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('professors');
  },

  down: async (queryInterface, Sequelize) => {
    // You can add code here to recreate the table if needed
  }
};