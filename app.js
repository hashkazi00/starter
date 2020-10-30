const express = require('express');

const morgan = require('morgan'); //A third party middleware

//Load User Defined modules 
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//creating the app variable is by conventions and by calling express we add a bunch of functions/methods to the app variable
const app = express();

//1. MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

//2. ROUTE HANDLERS
//Relocated to Routes Folders


//3. ROUTES
// app.get('/api/v1/tours', getTours)
// app.post('/api/v1/tours', createTour)

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//4. SERVER
//Relocated ot server.js file

module.exports = app;

