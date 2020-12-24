const AppError = require('../utils/appError');
const { findByIdAndUpdate } = require('./../models/userModel');
const User = require('./../models/userModel')

const catchAsync = require('./../utils/catchAsync')

const filterObj = (obj, ...allowedFields) => {
    let newObj = {};
    console.log(obj);
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    console.log(newObj)
    return newObj;
}

exports.getAllUsers = catchAsync( async(req, res, next) => {
    const users = await User.find();


    res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
        status: 'success',
        results: users.length, //this property is a good practice wherever obvious and has nothing to do with JSend
        data: { users } //tours implies the name of the resources in the url
    })
});

exports.updateMe = catchAsync( async (req, res, next) => {
    //Create error if user posts password data
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('You cannot update password from this route!!', 400))
    } 

    //Update the user document
    //We'll use .findByIdAndUpdate() instead of .save(), as save leads to validation and that way we cannot partially update the document


    const filteredBody = filterObj(req.body, 'name','email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        runValidators:true,
        new:true
    })

    res.status(200).json({
        status:'success',
        updatedUser
    })
});

exports.deleteMe = catchAsync(async (req, res, next)=> {
    await User.findByIdAndUpdate(req.user.id, {active:false});
    res.status(204).json({
        status:'success',
        data:null
    })
});

exports.getUser = (req, res) => {
    res.status(500).json(
        {
            status: 'error',
            data: 'This route is not yet defined.'
        }
    )
};

exports.createUser = (req, res) => {
    res.status(500).json(
        {
            status: 'error',
            data: 'This route is not yet defined.'
        }
    )
};

exports.updateUser = (req, res) => {
    res.status(500).json(
        {
            status: 'error',
            data: 'This route is not yet defined.'
        }
    )
};
exports.deleteUser = (req, res) => {
    res.status(500).json(
        {
            status: 'error',
            data: 'This route is not yet defined.'
        }
    )
};