const db = require('../models/indexStart');
const createError = require('http-errors');
const { assignmentSchema } = require('../helpers/validationSchema');
const Assignment = db.Assignment;
const User = db.User;

module.exports = {
    upload: async (req, res, next) => {
        try {
            console.log(req.file); // Log the file object for debugging
            if (!req.file) {
                return next(createError.BadRequest('File is required'));
            }
    
            // Validate user
            if (!req.payload || !req.payload.UserId) { // Change req.user to req.payload
                return next(createError.Unauthorized('User  not authenticated'));
            }
    
            // Validate file path
            const { file_path } = await assignmentSchema.validateAsync({ file_path: req.file.path });
    
            const assignment = await Assignment.create({ 
                user_id: req.payload.UserId, // Use req.payload.UserId
                file_path
            });
    
            res.status(201).json({ message: 'Assignment uploaded successfully', assignment });
        } catch (error) {
            if (error.isJoi) {
                return next(createError.BadRequest(error.message));
            }
            console.error(error); // Log the error for debugging
            next(createError.InternalServerError('An error occurred while uploading the assignment'));
        }
    },
    // Get All Assignments (Admin)
    getAllAssignments: async (req, res, next) => {
        try {
            const assignments = await Assignment.findAll({
                include: [{ model: User, as: 'user', attributes: ['email'] }]
            });
            res.status(200).json(assignments); // Return assignments in JSON format
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

            res.status(200).json(assignments); // Return user's assignments in JSON format
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

            res.status(200).json(assignment); // Return the assignment in JSON format
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

            // Check if the assignment exists
            const assignment = await Assignment.findOne({ where: { id: assignmentId } });
            if (!assignment) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            // Optional: Check if the user is the owner of the assignment
            if (assignment.user_id !== req.user.id) {
                return next(createError.Forbidden('You do not have permission to update this assignment'));
            }

            const [updated] = await Assignment.update(updatedInfo, {
                where: { id: assignmentId }
            });

            if (!updated) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            res.status(200).json({ message: `Assignment ${assignmentId} updated successfully` });
        } catch (error) {
            next(error);
        }
    },

    // Delete Assignment
    deleteAssignment: async (req, res, next) => {
        try {
            const assignmentId = req.params.id;

            // Check if the assignment exists
            const assignment = await Assignment.findOne({ where: { id: assignmentId } });
            if (!assignment) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            // Optional: Check if the user is the owner of the assignment
            if (assignment.user_id !== req.user.id) {
                return next(createError.Forbidden('You do not have permission to delete this assignment'));
            }

            const deleted = await Assignment.destroy({ where: { id: assignmentId } });

            if (!deleted) {
                throw createError.NotFound(`Assignment with ID ${assignmentId} not found`);
            }

            res.status(200).json({ message: `Assignment with ID ${assignmentId} has been deleted` });
        } catch (error) {
            next(error);
        }
    }
}