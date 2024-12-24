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
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role:{
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue:'user'
        }
    });
// Hash password only once before saving to DB
User.beforeCreate(async (user) => {
    try {
        const salt = await bcrypt.genSalt(12);  // Use a salt with 12 rounds
        const hashedPwd = await bcrypt.hash(user.password, salt);  // Hash the password with the salt
        console.log("Password before hashing:", user.password);  // Debugging
        console.log("Password after hashing:", hashedPwd);  // Debugging
        user.password = hashedPwd;  // Save the hashed password
    } catch (error) {
        console.error("Error hashing password:", error);  // Debugging
        throw new Error("Failed to encrypt password");
    }
});

    
    
User.prototype.isValidPassword = async function (password) {
    try {
        console.log("Entered password:", password);  // Log entered password for debugging
        console.log("Stored hashed password:", this.password);  // Log the hashed password stored in DB
        const isMatch = await bcrypt.compare(password, this.password);  // Compare entered password with the hash
        return isMatch;  // Return true if passwords match, else false
    } catch (error) {
        console.error("Error comparing passwords:", error);  // Log any errors during comparison
        throw new Error("Password verification failed");
    }
};

    

    return User;
};
