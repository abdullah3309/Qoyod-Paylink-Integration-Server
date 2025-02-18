'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'teacherPercentageLiabilityAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Products', 'teacherPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('Products', 'teacherPercentageExpenseAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Products', 'teacherCommissionExpenseAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Products', 'couponAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'teacherPercentageLiabilityAccountId');
    await queryInterface.removeColumn('Products', 'teacherPercentage');
    await queryInterface.removeColumn('Products', 'teacherPercentageExpenseAccountId');
    await queryInterface.removeColumn('Products', 'teacherCommissionExpenseAccountId');
    await queryInterface.removeColumn('Products', 'couponAccountId');
  }
};