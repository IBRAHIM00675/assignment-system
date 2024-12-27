const Joi = require('joi');

const authSchema = Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').optional() 

});
const assignmentSchema = Joi.object({
    file_path: Joi.string().required(),
    title: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
    due_date: Joi.date().optional()
});


module.exports = {authSchema, assignmentSchema};