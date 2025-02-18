'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Teacher extends Model {
        static associate(models) {
            // define association here
        }
    }
    Teacher.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        teacherPercentageLiabilityAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        teacherCommissionExpenseAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        teacherPercentage: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        expenseAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        couponAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Teacher',
    });
    return Teacher;
};