const User = require('./../models/userModel')

const catchAsync = require('./../utils/catchAsync')

exports.getAllUsers = catchAsync( async(req, res, next) => {
    const users = await User.find();


    res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
        status: 'success',
        results: users.length, //this property is a good practice wherever obvious and has nothing to do with JSend
        data: { users } //tours implies the name of the resources in the url
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