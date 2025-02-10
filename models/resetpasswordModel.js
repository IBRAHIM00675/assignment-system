const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    const PasswordResetToken = sequelize.define("PasswordResetToken", {
        token_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id',
            },
        },
    }, {
        tableName: 'password_reset_tokens',
        timestamps: true,
    });

    // Generate a password reset token
    PasswordResetToken.generateToken = function (userId) {
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000; 
        return { token, expires, user_id: userId };
    };

    return PasswordResetToken;
};