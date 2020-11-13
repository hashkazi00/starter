const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' })

//IF CURIOS ABOUT WHY WE DID NOT READ THE FILE TO REPLACE, NOTE THAT WE READ THE DOTENV IN THE ABOVE LINE AND WE AHVE ITS CONTENTS OVER HERE
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const app = require('./app');

mongoose.connect(DB, { // this object is just top avoid a few deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB con succesfull')
});


// console.log(process.env);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})
