const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Page = sequelize.define('Page', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    html: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    css: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    components: { // GrapesJS JSON
        type: DataTypes.TEXT,
        allowNull: true
    },
    styles: { // GrapesJS JSON
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Page;
