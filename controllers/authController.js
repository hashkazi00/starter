const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const catchAsync = require('./../utils/catchAsync');
const { check } = require('prettier');
const { promisify } = require('util')

const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET,  {expiresIn: process.env.JWT_EXPIRESIN});
};

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body); //this way anyone cann set admin row as true
    //We only want to allow a few fields to be entered by the user 
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt:req.body.passwordChangedAt
    })

    //JWT , the payload is the auto generated id , 
    const token = signToken(newUser._id);
    res.status(201).json({
        status:'success',
        token,
        data:{
            user: newUser
        }
    })
} );

    exports.login = catchAsync( async (req,res,next)=> {
        // 1) Extract the email and pasword from the request that came in most probably due to logging in 
        const {email, password} = req.body;

        // 2) Check if both exist(i.e. user entered them in the form) and in case they don't return and error
        if(!email || !password){
            return next(new AppError('Please provide email and password!', 400)); //Whatever we pass to error is considered as error by our global error handler
        }

        // 3) Check if user exists and pass is correct, note we need to explicitly select  the password field as we set it to be excluded in thje model by putting "select:false;"

        //the +password is a mongoose convention

        const user = await User.findOne({email}).select('+password');
        //instead of putting the below line here we could do better
        // const correctPassword = await User.correctPassword(password, user.password);

        if(!user || !(await user.correctPassword(password, user.password))){
            return next(new AppError('Incorrect Password or Email!!', 401))
        }

        // 4) If everything okay send token to client
        const token = signToken(user._id);
        res.status(201).json({
            status:"success",
            token
        })
    })

    exports.protect = catchAsync( async (req, res, next) => {
        //Getting token from the request object and check if it's there
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token){
            return next(new AppError('You are not logged in, please log in!', 401));
        }
        // console.log(token);

        //Verify the token for manipulation and expiration(which is specified in the .env file)
        //jwt.verify(token, process.env.JWT_SECRET) is an async method so it'll be better if we promisify it
        //Instead of promisfying programmatically we'll use the promisify util node method which does the same
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        // console.log(decoded);  

        //Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if(!currentUser){
            return next(new AppError('The user belonging to token no longer exist!', 401))
        }
        //check if user changed password after token being issued
        if(currentUser.changedPasswordAfter(decoded.iat)){
            return next(new AppError("Recently changed password please login again!!", 401));
        }
        

        // grant access to the protected route
        req.user = currentUser;
        next();
    })