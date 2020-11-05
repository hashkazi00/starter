//A Router Mini App
const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router(); //1. create a router

router.param('id', tourController.checkID);



//2. Manipulate the router object, notre that .route() is a middleware 
router.route('/').get(tourController.getTours).post(tourController.checkBody, tourController.createTour);

router.route('/:id').get(tourController.getTourById).patch(tourController.updateTour).delete(tourController.deleteTour)

//3. Export the manipulated router object
module.exports = router;