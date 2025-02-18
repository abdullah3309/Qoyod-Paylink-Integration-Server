'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SyncLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SyncLog.init({
    timestamp: DataTypes.DATE,
    transactionId: DataTypes.STRING,
    invoiceId: DataTypes.INTEGER,
    entityType: DataTypes.STRING,
    entityName: DataTypes.STRING,
    status: DataTypes.STRING,
    message: DataTypes.TEXT,
    errorCode: DataTypes.STRING,
    errorDetails: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'SyncLog',
  });
  return SyncLog;
};