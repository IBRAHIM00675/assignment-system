const express = require('express');
const routes = express.Router();
const assignmentController = require('../controllers/assignmentController');
const upload = require('../uploads/fs');
const { verifyAccessToken, restrict } = require('../helpers/jwtHelper');

// Upload Assignment
routes.post('/upload', verifyAccessToken, upload.single('file'), assignmentController.upload);

// users can search their own assignments
routes.get('/search', verifyAccessToken, assignmentController.searchAssignments);

// Route to generate the report
routes.get('/generate-report', verifyAccessToken, assignmentController.generateReport);

// Get All Assignments (Admin)
routes.get('/getAllAssignments', verifyAccessToken, restrict('admin'), assignmentController.getAllAssignments);

// Get Assignments by User (Authenticated User)
routes.get('/getUserAssignments', verifyAccessToken, assignmentController.getUserAssignments);

routes.get('/getAssignmentById/:id', verifyAccessToken, restrict('admin'), assignmentController.getAssignmentById);

routes.patch('/updateAssignment/:id', verifyAccessToken, restrict('admin'), assignmentController.updateAssignment);

routes.delete('/deleteAssignment/:id',verifyAccessToken, restrict('admin'), assignmentController.deleteAssignment);

module.exports = routes;
