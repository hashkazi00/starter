const fs = require('fs');
const express = require('express');

const app = express(); //creating the app variable is by conventions and by calling express we add a bunch of functions/methods to the app variable

app.use(express.json());
//express.json is a middleware and a middle ware can modify the incoming request data 
// it stands between request and response

// app.get('/', (req, res) => { //The route with the 'get' method on it
//     //the req and res are similar to vanilla node but contain a lot more data and methods

//     res.status(200)
//         .json({ //Like Stringify in vanilla nodejs
//             message: 'Hello from the server side',
//             app: 'Natours'
//         });
// });

// app.post('/', (req, res)  => {
//     res.send('YOu can post to this endpoint')
// })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));



app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({ //this enveloping is basedd on the `JSend` standard, google it incase ydk :) 
        status: 'success',
        results: tours.length, //this property is a good practice wherever obvious and has nothing to do with JSend
        data: { tours } //tours implies the name of the resources in the url
    })
})

app.get('/api/v1/tours/:id', (req, res) => {
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
})

app.post('/api/v1/tours', (req, res) => {
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
})


app.patch('/api/v1/tours/:id', (req, res) => {

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
})

app.delete('/api/v1/tours/:id', (req, res) => {

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
})

const port = 3000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

