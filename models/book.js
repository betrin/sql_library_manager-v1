'use strict';

const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class Book extends Sequelize.Model {
    
  }
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Title" is required'
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Author" is required'
        }
      }
    },
    genre: DataTypes.STRING,
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: '"Year" needs to be a number'
        },
        max: {
          args: new Date().getFullYear(),
          msg: '"Year" needs to be less than ' + new Date().getFullYear()
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};