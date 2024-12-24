require('dotenv').config();
const express = require('express');
const userRoute = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use( userRoute);

// 404 Handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
