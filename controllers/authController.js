const crypto = require('crypto')
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const { check } = require('prettier');
const { promisify } = require('util')

const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');


const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET,  {expiresIn: process.env.JWT_EXPIRESIN});
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIN * 24 * 60 * 60 * 1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
};

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body); //this way anyone cann set admin row as true
    //We only want to allow a few fields to be entered by the user 
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role 
    })

    //JWT , the payload is the auto generated id ,
    
    createSendToken(newUser, 201, res);
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
        createSendToken(user, 201, res);

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


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission!', 403));
        }
        next();
    }
};

exports.forgotPassword =  catchAsync( async (req, res, next) => {
    //1. Extract the user from the email received
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new AppError('There is no user as such', 404));
    }

    //2. Create a random reset token which will then act as a a temporary password for our user, as we have to the random creation and then encryption to be done, we separate the concerns 

    const resetToken = user.createResetPasswordToken();
    console.log(resetToken);
    // await user.save();//this won't work as we have validators in our schema the validation will fail upon saving the items craeted due to instance method above

    await user.save({ validateBeforeSave: false});

    // 3. Send resettoken to user via mail
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch resquest with your new password and confirmPassword to: ${resetURL}. If this was a mistake please ignore the URL.`;
    
    try{

        await sendEmail({
        email:user.email,
        subject:'Your password request token is valid for 10 minutes',
        message
        })

        res.status(200).json({
        status:'success',
        message: 'Token sent to email!!!'
        })

    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false});

        return next(new AppError('Error Sending Email Please Try Again Later', 500)); 
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1. Get user based on the token + checking if token has not expired
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne(
        {passwordResetToken: hashedToken,
        passwordResetExpires:{ $gt: Date.now()}
    });

    if(!user){
        return next(new AppError('Token invalid or expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 2. Change the passwordChangedAtProperty using mongoose middleware, in the models

    // 3. Logen the user In by signing the token

    createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync( async (req, res, next ) => {
    //Get the user from the mongodb collection
    const user = await User.findById(req.user.id).select('+password');

    //Chcek if the recived password is correct for the user 
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Password Incorrect!!', 401))
    }

    // Set the new password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //send the token

    createSendToken(user, 200, res);


});