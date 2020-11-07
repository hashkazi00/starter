//A Router Mini App
const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router(); //1. create a router

// router.param('id', tourController.checkID); //We check if the requested tours id is greater than the one required, in case of which we respond with an error, note that in caes of no id we don't get into this part because of reasons abstracted into the param() function


//2. Manipulate the router object, note that .route() is a middleware 
router.route('/get-tour-stats').get(tourController.getTourStats);
router.route('/get-monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/top-5-cheap').get(tourController.aliased, tourController.getTours);
router.route('/').get(tourController.getTours).post(tourController.createTour);

router.route('/:id').get(tourController.getTourById).patch(tourController.updateTour).delete(tourController.deleteTour)

//3. Export the manipulated router object
module.exports = router;