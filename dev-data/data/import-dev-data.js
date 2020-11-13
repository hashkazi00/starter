const fs = require('fs');

const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' })

const Tour = require('./../../models/tourModel')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB con succesfull')
});

//Read JSON FIle

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

//Import data into database

const importData = async () => {
    try {
        //the create method can accept a single JSON Object or an array of JSON Objects, In case of an array each item is created as a new document.
        await Tour.create(tours);
        console.log('Data Succesfully loaded');
    } catch (err) {
        console.log(err)
    }
    process.exit();
}

//Delete data form a db 

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data Succesfully deleted');
    } catch (err) {
        console.log(err)
    }
    process.exit();//an aggressive way to exit from a process, must not be used in production level code
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
} else {
    console.log(process.argv[2])
}

console.log(process.argv)