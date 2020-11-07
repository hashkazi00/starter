const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Name must be specified']
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
        required: [true, 'A tour must have a Group Size specified']
    }
    ,
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price must be specified']
    },
    priceDiscount: Number,
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
    startDates: [Date]//Whatever we pass mongodb will try to prase it as a Date, if it can't it will throw an erroe

});

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;