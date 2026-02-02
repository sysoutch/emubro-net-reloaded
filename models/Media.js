const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/emubro.sqlite'),
    logging: false
});

const Media = sequelize.define('Media', {
    filename: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING }, // 'image' or 'video'
    originalName: { type: DataTypes.STRING },
    altText: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER }
});

module.exports = { sequelize, Media };
