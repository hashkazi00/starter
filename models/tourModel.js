const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Name must be specified'],
        maxlength: [40, "The tour name cannot exceed 40 Chars"],
        minlength: [10, "The tour name should be atleast 10 Chars"]
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration specified']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a Group Size specified']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a Group Size specified'],
        enum: {
            values: ["easy", "medium", "difficult"],
            message: 'Difficulty is either of the three: easy, medium or difficult'
        }
    }
    ,
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating Must Be Above 1"],
        max: [5, "Rating Must Be Below 5"]
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price must be specified']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator:
                function (val) {
                    return this.price > val;
                },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        required: [true, 'Summary should be specified'],
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Cover image should be specified']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],//Whatever we pass mongodb will try to prase it as a Date, if it can't it will throw an erroe
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation:{
        //note that this does not take schematype options instead it is the embebbed document iteslt
        type:{
            type:String, 
            default:'Point',
            enum:['Point']
        },
        coordinates: [Number],
        address: String, 
        description: String
    },
    locations:[
        {
            type:{
            type:String, 
            default:'Point',
            enum:['Point']
            },
            coordinates: [Number],
            address: String, 
            description: String,
            day:Number
        }
    ],
    guides:[
         {
             type:mongoose.Schema.ObjectId,
             ref: 'User' //ref is where magic happens, establishes aref between tours and users dataset
         }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

tourSchema.pre('save', function (next) {
    // console.log(this)
    this.slug = slugify(this.name, { lower: true });
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    // console.log(this);
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`)
    // console.log(docs);
    next();
})

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    console.log(this.pipeline());
    next();
})


///the below code is to show that multiple pre or post middleware to a hook(event)
// tourSchema.pre('save', function (next) {
//     console.log("Kar du save??? bhaiiii");
//     next();
// })

// tourSchema.post('save', function (doc, next) {
//     console.log(this);
//     next();
// })

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;