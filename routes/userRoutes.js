const express = require('express')
const routes = express.Router()
const userController = require('../controllers/userController')

routes.post('/register', userController.register)

routes.post('/login', userController.login)


routes.get('/getAllUser', userController.getAllUser)

routes.get('/getUserById/:user_id', userController.getUserById)

routes.patch('/updateUser/:user_id', userController.updateUser)

routes.delete('/deleteUser/:user_id', userController.deleteUser)


module.exports = routes