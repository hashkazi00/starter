const Tour = require('./../models/tourModel')

const catchAsync = require('./../utils/catchAsync')

const AppError = require('./../utils/appError');

const APIFeatures = require('./../utils/apiFeatures')

exports.aliased = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratnigsAverage'
    next();
}
///////////////////////////////////////1
// exports.getTours = async (req, res) => {
//     try {
//         //Build Query

//         //1. Filtering
//         // const queryObj = { ...req.query };

//         // const excludedParams = ['page', 'sort', 'limit', 'fields'];

//         // excludedParams.forEach(el => delete queryObj[el]);//permanently deletes the queryObj objects matched property 


//         //2. Advanced Filtering

//         // let queryStr = JSON.stringify(queryObj);//converted to a JSON string(just a normal string to be clear) from js object so that we can make use of the replace method on the json string

//         // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

//         // what was that regex all about? \b is used to restrict the regex to match exact words, () is so that we can or(|) multiple options and /g is for multiple matches

//         // let query = Tour.find(JSON.parse(queryStr));

//         // 3. Sorting

//         // if (req.query.sort) {
//         //     const sortBy = req.query.sort.split(',').join(" ");
//         //     query = query.sort(sortBy);
//         // } else {
//         //     query = query.sort('-createdAt')//negative so that we sort in descending order and see the last adedd first
//         // }

//         // 4. Limiting Fields 

//         // if (req.query.fields) {
//         //     const field = req.query.fields.split(',').join(" ");
//         //     query = query.select(field);//like projection
//         // } else {
//         //     query = query.select('-__v')
//         // }

//         //5. Pagination
//         // const page = req.query.page * 1 || 1;
//         // const limit = req.query.limit * 1 || 100;
//         // const skip = (page - 1) * limit;

//         // query = query.skip(skip).limit(limit);

//         // if (req.query.page) {
//         //     const numTours = await Tour.countDocuments();
//         //     if (skip >= numTours) throw new Error('This page does not exist'); //By throwing an error we exit the try block in case of truthy evalution of this statement and get into the catch block to send err response
//         // }

//         //Execute query
//         const features =
//             new APIFeatures(Tour.find(), req.query).filter().sort().limiting().paginate();
//         const tours = await features.query;

//         // console.log(req.query, queryObj);

//         //Respond to client
//         res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
//             status: 'success',
//             results: tours.length, //this property is a good practice wherever obvious and has nothing to do with JSend
//             data: { tours } //tours implies the name of the resources in the url
//         })

//     } catch (err) {
//         res.status(404).json({
//             "status": "failed",
//             "message": err
//         })
//     }

// }

///////////////////////////////////////2
exports.getTours = catchAsync(async (req, res, next) => {
    const features =
        new APIFeatures(Tour.find(), req.query).filter().sort().limiting().paginate();
    const tours = await features.query;

    // console.log(req.query, queryObj);

    //Respond to client
    res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
        status: 'success',
        results: tours.length, //this property is a good practice wherever obvious and has nothing to do with JSend
        data: { tours } //tours implies the name of the resources in the url
    })

});


exports.getTourById = catchAsync(async (req, res, next) => {
    // const tour = await Tour.findById(req.params.id).populate('guides');
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('Looks like you hit an incorrect ID', 404));
    }
    //shorthand for the .findOne mongodb query methods
    res.status(200).json({
        status: 'success',
        data: { tour }
    })

});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        "status": "success",
        "data": {
            tour: newTour
        }
    });

});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!tour) {
        return next(new AppError('Looks like you hit an incorrect ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })

});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('Looks like you hit an incorrect ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 4.5 }
            }
        },
        {
            $group: {
                // _id: '$difficulty',
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: {
                maxPrice: -1
            }
        }
    ])

    res.status(201).json({
        "status": "success",
        "data": {
            stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                //$month is a special mongoidb operator more on it in the docs 
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                //$push is a special mongo operator that creates an array and pushes the necessary data for a particular kind of documents into it 
                tours: { $push: '$name' }
            }
        },
        //addfields stage is used to add anew field
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                // month: 1
                numTours: -1
            }
        },
        {
            $limit: 12
        }
    ]);
    res.status(201).json({
        "status": "success",
        "data": {
            plan
        }
    });
});