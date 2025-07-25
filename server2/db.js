const {Sequelize} = require('sequelize')

const sequelize = new Sequelize('testdb','postgres','4747',{
    dialect:"postgres"
})

module.exports = sequelize;