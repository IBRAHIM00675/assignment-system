const db = require('../models/indexStart');
const createError = require('http-errors');
const { assignmentSchema } = require('../helpers/validationSchema');
const { Op } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');
const Assignment = db.Assignment;
const User = db.User;

module.exports = {
    upload: async (req, res, next) => {
        try {
            // Log the file object for debugging
            console.log(req.file);
    
            // Check if file is uploaded
            if (!req.file) {
                return next(createError.BadRequest('File is required'));
            }
    
            // Validate user authentication via the payload
            if (!req.payload || !req.payload.UserId) {  // Make sure this is the correct field name from the payload
                return next(createError.Unauthorized('User not authenticated'));
            }
    
            // Validate file path using Joi schema (ensure assignmentSchema is defined properly)
            const { file_path } = await assignmentSchema.validateAsync({ file_path: req.file.path });
    
            // Create a new assignment in the database
            const assignment = await Assignment.create({
                user_id: req.payload.UserId,  // Assuming 'UserId' is in the payload
                file_path: file_path, // The validated file path
                uploaded_at: new Date()  // Optionally set the upload timestamp
            });
    
            // Respond with success message and the assignment details
            res.status(201).json({ message: 'Assignment uploaded successfully', assignment });
        } catch (error) {
            // Handle Joi validation errors
            if (error.isJoi) {
                return next(createError.BadRequest(error.message));
            }
    
            // Log and handle any other internal errors
            console.error(error);  // For debugging purposes
            next(createError.InternalServerError('An error occurred while uploading the assignment'));
        }
    },
    

    searchAssignments: async (req, res, next) => {
        try {
            const { title, uploaded_at, user_id } = req.query;
    
            // Access the UserId from the token payload
            const userRole = req.payload?.role;  // Role from JWT
            const userId = req.payload?.UserId; // Use UserId as in the token payload
    
            if (!userRole || !userId) {
                return next(createError.Unauthorized('User data missing from token'));
            }
    
            let whereClause = {};
    
            // Search for a specific user (Admin Only)
            if (user_id && userRole === 'admin') {
                whereClause.user_id = user_id;
            }
    
            // Regular users can only search their own assignments
            if (userRole !== 'admin') {
                whereClause.user_id = userId;  // Ensure userId is used correctly
            }
    
            // Filter by title (optional)
            if (title) {
                whereClause.title = { [Op.like]: `%${title}%` };
            }
    
            // Filter by upload date (optional)
            if (uploaded_at) {
                whereClause.uploaded_at = { [Op.gte]: new Date(uploaded_at) };
            }
    
            const assignments = await Assignment.findAll({
                where: whereClause,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['email', 'role']
                }]
            });
    
            res.status(200).json(assignments);
        } catch (error) {
            console.error('Search error:', error);
            next(error);
        }
    },

    generateReport: async (req, res, next) => {
        try {
            // Check if the user is an admin
            const userRole = req.payload.role;
            if (userRole !== 'admin') {
                return next(createError.Forbidden('Only admins can generate reports'));
            }
    
            // Fetch the assignment data, including the associated user data
            const assignments = await Assignment.findAll({
                include: [{ model: User, as: 'user', attributes: ['user_id', 'email'] }]
            });
    
            if (!assignments.length) {
                return next(createError.NotFound('No assignments found'));
            }
    
            // Prepare the data for CSV export
            const reportData = assignments.map(assignment => ({
                assignmentId: assignment.id,
                userEmail: assignment.user.email,
                filePath: assignment.file_path,
                uploadedAt: assignment.uploaded_at ? assignment.uploaded_at.toLocaleString('en-US') : 'N/A' // Format the date and time
            }));
    
            // Define the CSV file path
            const csvFilePath = path.join('uploads', 'assignment_report.csv');
    
            // Ensure the uploads directory exists
            if (!fs.existsSync('uploads')) {
                fs.mkdirSync('uploads');
            }
    
            // Initialize the CSV writer
            const csvWriterInstance = createCsvWriter({
                path: csvFilePath,
                header: [
                    { id: 'assignmentId', title: 'Assignment ID' },
                    { id: 'userEmail', title: 'User Email' },
                    { id: 'filePath', title: 'File Path' },
                    { id: 'uploadedAt', title: 'Uploaded At' }
                ]
            });
    
            // Write the records to the CSV file
            await csvWriterInstance.writeRecords(reportData);
    
            // Send the CSV file as a download
            res.download(csvFilePath, 'assignment_report.csv', (err) => {
                if (err) {
                    console.error(err);
                    return next(createError.InternalServerError('Failed to download report'));
                }
            });
    
        } catch (error) {
            console.error(error);
            next(createError.InternalServerError('An error occurred while generating the report'));
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