const express = require('express');
const routes = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Upload Assignment
routes.post('/upload', assignmentController.upload);

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
