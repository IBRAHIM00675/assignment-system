require('dotenv').config();
const express = require('express');
const limit = require('express-rate-limit');
const  helmet = require('helmet');
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const resetpasswordRoutes = require('./routes/resetpasswordRoutes')
const path = require('path'); 



const app = express();


// helmet
app.use(helmet());
const limiter = limit ({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many  request from this IP, try again in an hour'
});
app.use("/api", limiter);


// cors
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use("/api", userRoutes);
app.use("/api", assignmentRoutes);
app.use("/api", resetpasswordRoutes);


app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});


app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
