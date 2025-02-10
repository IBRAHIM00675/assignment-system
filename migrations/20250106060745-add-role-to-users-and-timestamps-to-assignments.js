'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add 'role' column to 'users' table
        await queryInterface.addColumn('users', 'role', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user'  // Default role is 'user'
        });

        // Add 'createdAt' and 'updatedAt' columns to 'assignments' table
        await queryInterface.addColumn('assignments', 'createdAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Sets default to current timestamp
        });
        await queryInterface.addColumn('assignments', 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Sets default to current timestamp
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove 'role' column from 'users' table
        await queryInterface.removeColumn('users', 'role');

        // Remove 'createdAt' and 'updatedAt' columns from 'assignments' table
        await queryInterface.removeColumn('assignments', 'createdAt');
        await queryInterface.removeColumn('assignments', 'updatedAt');
    }
};
