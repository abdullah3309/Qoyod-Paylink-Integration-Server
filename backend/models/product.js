'use strict';
const {
  Model
} = require('sequelize');

const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,  // Automatically generates a unique ID
      allowNull: false,
      primaryKey: true,
    },
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