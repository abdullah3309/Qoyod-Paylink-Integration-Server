'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    productName: DataTypes.STRING,
    teacherCommissionExpenseAccountId: DataTypes.INTEGER,
    teacherPercentageExpenseAccountId: DataTypes.INTEGER,
    teacherPercentage: DataTypes.FLOAT,
    teacherPercentageLiabilityAccountId: DataTypes.INTEGER,
    productRevenueAccountId: DataTypes.INTEGER,
    couponAccountId: DataTypes.INTEGER  // Added new field
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};