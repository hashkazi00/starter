const express = require('express');

const morgan = require('morgan'); //A third party middleware

const appError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

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


// '.all' implies every method on the route defined within, `*` defines all te urls that reach this middleware :), 
app.all('*', (req, res, next) => {
    //////////////1
    // res.status(404).json({
    //     status: 'failed',
    //     message: `Cannot find ${req.originalUrl}`
    // });
    ////////////2
    // const err = new Error(`Cannot find ${req.originalUrl}`);
    // err.statusCode = 404;
    // err.status = 'failed';
    ////////////3
    // const err = new appError(`Cannot find ${req.originalUrl}`, 404);
    // next(err); //whenever we pass in a argument to the next method in an middleware express withstands the excution of every middle ware between the error middleware

    //////////4
    next(new appError(`Cannot find ${req.originalUrl}`, 404));
})


//error middleware with the error handler inside
app.use(globalErrorHandler);

//4. SERVER
//Relocated ot server.js file

module.exports = app;

