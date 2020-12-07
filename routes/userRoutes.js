//A Router Mini App

const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');


const router = express.Router();

//Authentication related
router.post('/signup', authController.signup);
router.post('/login', authController.login);

//Admin Related routes
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);


module.exports = router;
