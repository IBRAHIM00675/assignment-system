const db = require('../models/indexStart');
const createError = require('http-errors');
const { assignmentSchema } = require('../helpers/validationSchema');
const Assignment = db.Assignment;
const User = db.User;

module.exports = {

    // Upload Assignment
    upload: async (req, res, next) => {
        try {
            const { file_path } = await assignmentSchema.validateAsync(req.body);
            const userId = req.user.id;  // From JWT authentication middleware
            
            const assignment = await Assignment.create({ 
                user_id: userId, 
                file_path
            });

            res.status(201).send({ message: 'Assignment uploaded successfully', assignment });
        } catch (error) {
            if (error.isJoi) {
                return next(createError.BadRequest(error.message));
            }
            next(error);
        }
    },

    // Get All Assignments (Admin)
    getAllAssignments: async (req, res, next) => {
        try {
            const assignments = await Assignment.findAll({
                include: [{ model: User, as: 'user', attributes: ['email'] }]
            });
            res.status(200).send(assignments);
        } catch (error) {
            next(error);
        }
    },

    // Get User's Assignments
    getUserAssignments: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const assignments = await Assignment.findAll({
                where: { user_id: userId }
            });

            res.status(200).send(assignments);
        } catch (error) {
            next(error);
        }
    },

    // Get Assignment By ID
    getAssignmentById: async (req, res, next) => {
        try {
            const assignmentId = req.params.id;
            const assignment = await Assignment.findOne({ where: { id: assignmentId } });

            if (!assignment) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            res.status(200).send(assignment);
        } catch (error) {
            next(error);
        }
    },

    // Update Assignment
    updateAssignment: async (req, res, next) => {
        try {
            const assignmentId = req.params.id;
            const { file_path } = req.body;

            const updatedInfo = {};
            if (file_path) updatedInfo.file_path = file_path;

            const [updated] = await Assignment.update(updatedInfo, {
                where: { id: assignmentId }
            });

            if (!updated) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            res.status(200).send({ message: `Assignment ${assignmentId} updated successfully` });
        } catch (error) {
            next(error);
        }
    },

    // Delete Assignment
    deleteAssignment: async (req, res, next) => {
        try {
            const assignmentId = req.params.id;
            const deleted = await Assignment.destroy({ where: { id: assignmentId } });

            if (!deleted) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            res.status(200).send(`Assignment with ID ${assignmentId} has been deleted`);
        } catch (error) {
            next(error);
        }
    }
};
