const Joi = require('joi');

const authSchema = Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').optional() 

})

module.exports = {authSchema}