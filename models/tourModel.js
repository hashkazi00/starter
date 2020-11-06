const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Name must be specified']
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'Price must be specified']
    }
});

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;