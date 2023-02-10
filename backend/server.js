const app = require('./app');
const databaseConnect = require('./config/database');

//Handling Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Uncaught Exceptions.`);

    process.exit(1)
})

//database connect 
databaseConnect();

const server = app.listen(process.env.PORT, () => {
    console.log("App started at port " + process.env.PORT)
})

//Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection.`);

    server.close(() => {
        process.exit(1)
    })
})