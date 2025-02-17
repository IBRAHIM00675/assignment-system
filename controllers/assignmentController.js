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
            if (!req.file) return next(createError.BadRequest('File is required'));
            if (!req.user?.id) return next(createError.Unauthorized('User not authenticated'));

            const file_path = req.file.path.replace(/\\/g, '/'); 
            
            // Validate file path
            const { error } = assignmentSchema.validate({ file_path });
            if (error) return next(createError.BadRequest(error.message));

            const assignment = await Assignment.create({
                user_id: req.user.id,
                file_path,
                uploaded_at: new Date()
            });

            res.status(201).json({ message: 'Assignment uploaded successfully', assignment });
        } catch (error) {
            next(createError.InternalServerError('An error occurred while uploading the assignment'));
        }
    },

    searchAssignments: async (req, res, next) => {
        try {
            const { title, uploaded_at, user_id, file_path } = req.query;
            const { id: userId, role } = req.user;

            if (!userId) return next(createError.Unauthorized('User data missing from token'));

            let whereClause = {};
            if (user_id && role === 'admin') whereClause.user_id = user_id;
            if (role !== 'admin') whereClause.user_id = userId;

            if (title) whereClause.title = { [Op.like]: `%${title}%` };
            if (uploaded_at) whereClause.uploaded_at = { [Op.gte]: new Date(uploaded_at) };
            if (file_path) whereClause.file_path = { [Op.like]: `%${file_path}%` };

            const assignments = await Assignment.findAll({
                where: whereClause,
                include: [{ model: User, as: 'user', attributes: ['email', 'role'] }]
            });

            res.status(200).json(assignments);
        } catch (error) {
            next(error);
        }
    },

    // Get All Assignments (Admin)
getAllAssignments: async (req, res, next) => {
    try {
        const assignments = await Assignment.findAll({
            include: [{
                model: User,
                as: 'user', 
                attributes: ['email', 'role'] // Fetch email and role
            }]
        });

        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        next(error);
    }
},

// Get Assignments for a Specific User (Normal Users)
getUserAssignments: async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const userId = req.user.id;
        const assignments = await Assignment.findAll({
            where: { user_id: userId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['email']
            }]
        });

        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error fetching user assignments:", error);
        next(error);
    }
},



    getAssignmentById: async (req, res, next) => {
        try {
            const assignment = await Assignment.findOne({
                where: { id: req.params.id },
                include: { model: User, as: "user", attributes: ["email"] }
            });

            if (!assignment) return next(createError.NotFound(`Assignment with ID ${req.params.id} not found`));

            res.status(200).json(assignment);
        } catch (error) {
            next(error);
        }
    },

    updateAssignment: async (req, res, next) => {
        try {
            const { file_path } = req.body;
            const assignment = await Assignment.findOne({ where: { id: req.params.id } });

            if (!assignment) return next(createError.NotFound(`Assignment with ID ${req.params.id} not found`));
            if (assignment.user_id !== req.user.id) return next(createError.Forbidden('You do not have permission'));

            await assignment.update({ file_path });
            res.status(200).json({ message: `Assignment updated successfully`, assignment });
        } catch (error) {
            next(error);
        }
    },

    deleteAssignment: async (req, res, next) => {
        try {
            const assignment = await Assignment.findOne({ where: { id: req.params.id } });
            if (!assignment) return next(createError.NotFound(`Assignment with ID ${req.params.id} not found`));
            if (assignment.user_id !== req.user.id) return next(createError.Forbidden('You do not have permission'));

            await Assignment.destroy({ where: { id: req.params.id } });
            res.status(200).json({ message: `Assignment deleted successfully` });
        } catch (error) {
            next(error);
        }
    },
    generateReport: async (req, res, next) => {
        try {
            // Check if the user is an admin
            const userRole = req.user.role;
            if (userRole !== 'admin') {
                return next(createError.Forbidden('Only admins can generate reports'));
            }
    
            // Fetch the assignment data, including the associated user data
            const assignments = await Assignment.findAll({
                include: [{ model: User, as: 'user', attributes: ['email'] }]
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
    
};
