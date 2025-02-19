const db = require('../models/indexStart');
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const crypto = require('crypto');
const { Op } = require('sequelize');
const transporter = require('../email/transporter');

const { User, PasswordResetToken } = db;

module.exports = {
    sendPasswordResetEmail: async (user, email) => {
        try {
            const { token, expires } = PasswordResetToken.generateToken(user.user_id); 
            console.log("Generated Token:", token); 
            console.log("Expires:", new Date(expires).toLocaleString()); 

            await PasswordResetToken.create({ token, expires, user_id: user.user_id }); 
            console.log("Token saved to database.");

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset',
                text: `You are receiving this email because you requested a password reset.\n\n` +
                      `Please click the following link to reset your password:\n` +
                      `http://localhost:3000/reset-password?token=${token}\n\n` +  // <-- Ensure this is your frontend URL
                      `If you did not request this, please ignore this email.`
            };

            await transporter.sendMail(mailOptions);    
            console.log("Password reset email sent.");
        } catch (error) {
            console.error("Error in sendPasswordResetEmail:", error);
            throw error;
        }
    },

    resetUserPassword: async (user, newPassword) => {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save(); 

        
        await PasswordResetToken.destroy({ where: { user_id: user.user_id } });
    },

    handlePasswordResetRequest: async (req, res, next) => {
        const { email } = req.body;

        try {
            console.log("Handling password reset request for email:", email);
            const user = await User.findOne({ where: { email } });

            if (!user) {
                console.log("User not found for email:", email);
                return next(createError.NotFound('User not found'));
            }

            await module.exports.sendPasswordResetEmail(user, email); 
            return res.status(200).send('Password reset email sent!');
        } catch (error) {
            console.error('Error occurred:', error);
            return next(createError.InternalServerError('An error occurred while processing the request'));
        }
    },

    handlePasswordReset: async (req, res, next) => {
        const { token, password } = req.body;  

        if (!token || !password) {
            console.log("Missing token or password in request body");
            return next(createError.BadRequest('Token and password are required'));
        }

        try {
            console.log("Handling password reset with token:", token);

            const resetToken = await PasswordResetToken.findOne({
                where: {
                    token,
                    expires: { [Op.gt]: Date.now() } 
                },
                include: [{ model: User, as: 'user' }]
            });

            if (!resetToken || !resetToken.user) {
                console.log("Invalid or expired token:", token);
                return next(createError.BadRequest('Password reset token is invalid or has expired.'));
            }

            console.log("Resetting password for user:", resetToken.user.email);

            const hashedPassword = await bcrypt.hash(password, 12);
            console.log("New hashed password:", hashedPassword);

            resetToken.user.password = hashedPassword;
            await resetToken.user.save();
            console.log("Password updated in the database.");

            await PasswordResetToken.destroy({ where: { user_id: resetToken.user.user_id } });
            console.log("Reset tokens deleted for user:", resetToken.user.user_id);

            return res.status(200).send('Password has been reset successfully.');
        } catch (error) {
            console.error('Error occurred:', error);
            return next(createError.InternalServerError('An error occurred while processing the request'));
        }
    }
    
};