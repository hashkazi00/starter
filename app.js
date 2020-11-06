const express = require('express');

const morgan = require('morgan'); //A third party middleware

//Load User Defined modules 
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//creating the app variable is by conventions and by calling express we add a bunch of functions/methods to the app variabledffsd
const app = express();

//1. MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json()); //using this middleware gives us access to the body of the request

app.use(express.static(`${__dirname}/public`));

//2. ROUTE HANDLERS
//Relocated to Controllers


//3. ROUTES                                                                                                                               
// app.get('/api/v1/tours', getTours)
// app.post('/api/v1/tours', createTour)

app.use('/api/v1/tours', tourRouter);//In case of routers which are a middleware we need to route this way
app.use('/api/v1/users', userRouter);

//4. SERVER
//Relocated ot server.js file

module.exports = app;

