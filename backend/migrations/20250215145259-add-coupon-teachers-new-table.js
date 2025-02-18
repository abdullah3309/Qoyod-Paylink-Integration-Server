'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teachers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      teacherPercentageLiabilityAccountId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      teacherCommissionExpenseAccountId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      teacherPercentage: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      expenseAccountId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      couponAccountId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Teachers');
  }
};