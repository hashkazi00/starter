const Tour = require('./../models/tourModel')

exports.getTours = async (req, res) => {
    try {
        const tours = await Tour.find();
        res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
            status: 'success',
            results: tours.length, //this property is a good practice wherever obvious and has nothing to do with JSend
            data: { tours } //tours implies the name of the resources in the url
        })
    } catch (err) {
        res.status(404).json({
            "status": "failed",
            "message": err
        })
    }

}

exports.getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        //shorthand for the .findOne mongodb query methods
        res.status(200).json({
            status: 'success',
            data: { tour }
        })
    } catch (err) {
        res.status(404).json({
            "status": "failed",
            "message": err
        })
    }


}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            "status": "success",
            "data": {
                tour: newTour
            }
        });

    } catch (err) {
        res.status(400).json({
            "status": "failed",
            "message": "Invalid Data Sent"
        })
    }

}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })

    } catch (err) {
        res.status(400).json({
            "status": "failed",
            "message": "Invalid Data Sent"
        })
    }

}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        res.status(400).json({
            "status": "failed",
            "message": "Invalid Data Sent"
        })
    }


}