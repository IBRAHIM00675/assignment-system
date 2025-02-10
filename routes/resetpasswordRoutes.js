const express = require('express');
const routes = express.Router();
const resetpasswordController = require('../controllers/resetpasswordController');

// Route to request a password reset
routes.post('/request-password-reset', resetpasswordController.handlePasswordResetRequest);

// Route to reset the password
routes.post('/reset-password', resetpasswordController.handlePasswordReset);

module.exports = routes;