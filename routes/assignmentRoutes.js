const express = require('express');
const routes = express.Router();
const assignmentController = require('../controllers/assignmentController');
const upload = require('../uploads/fs');
const { verifyAccessToken, restrict } = require('../helpers/jwtHelper');

// Upload Assignment
routes.post('/upload', verifyAccessToken, restrict('admin'), upload.single('file'), assignmentController.upload);

// Get All Assignments (Admin)
routes.get('/getAllAssignments', assignmentController.getAllAssignments);

// Get Assignments by User (Authenticated User)
routes.get('/getUserAssignments', assignmentController.getUserAssignments);

// Get Assignment by ID
routes.get('/getAssignmentById/:id', assignmentController.getAssignmentById);

// Update Assignment by ID
routes.patch('/updateAssignment/:id', assignmentController.updateAssignment);

// Delete Assignment by ID
routes.delete('/deleteAssignment/:id', assignmentController.deleteAssignment);

module.exports = routes;
