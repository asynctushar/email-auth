const express = require('express');
const errorMiddleware = require('./middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require('dotenv').config({ path: "backend/config/config.env" })
}

//Routes import
const user = require('./routes/userRoute');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "PRODUCTION") {
    app.use(require('cors')({
        origin: process.env.FRONTEND_URL,
        optionsSuccessStatus: 200
    }))
}

app.use('/api/v1', user);

//Middlewares for Errors
app.use(errorMiddleware);


module.exports = app;