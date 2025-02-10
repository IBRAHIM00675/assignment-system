const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user'
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    // Hash password before saving to DB
    User.beforeCreate(async (user) => {
        try {
            const salt = await bcrypt.genSalt(12);
            const hashedPwd = await bcrypt.hash(user.password, salt);
            console.log("Password before hashing:", user.password);
            console.log("Password after hashing:", hashedPwd);
            user.password = hashedPwd;
        } catch (error) {
            console.error("Error hashing password:", error);
            throw new Error("Failed to encrypt password");
        }
    });

    // Method to validate password
    User.prototype.isValidPassword = async function (password) {
        try {
            console.log("Entered password:", password);
            console.log("Stored hashed password:", this.password);
            const isMatch = await bcrypt.compare(password, this.password);
            return isMatch;
        } catch (error) {
            console.error("Error comparing passwords:", error);
            throw new Error("Password verification failed");
        }
    };

    return User;
};