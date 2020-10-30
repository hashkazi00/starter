const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


exports.getTours = (req, res) => {
    res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
        status: 'success',
        results: tours.length, //this property is a good practice wherever obvious and has nothing to do with JSend
        data: { tours } //tours implies the name of the resources in the url
    })
}

exports.getTourById = (req, res) => {
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id); //the first item with the matched id is returned 

    if (!tour) {
        return res.status(404).json({
            status: 'failed',
            data: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data: { tour }
    })
}

exports.createTour = (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;

    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            "status": "success",
            "data": {
                tour: newTour
            }
        })
    })
}

exports.updateTour = (req, res) => {

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'failed',
            data: 'Invalid ID'
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

exports.deleteTour = (req, res) => {

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'failed',
            data: 'Invalid ID'
        })
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
}