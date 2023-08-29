var Exoplanets = require('./exoplanet');
const csv = require('fast-csv'); // parses CSV files
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const main = async () => {

    // connect to db
    const mongoDB = process.env.MONGODB_URI; 
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    // read csv file
    const exoplanets = [];
    fs.createReadStream(path.join(__dirname, '/exoplanets.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', function(data) {
            data['_id'] = new mongoose.Types.ObjectId();
            exoplanets.push(data);
        })
        .on('end', function(){
            // insert exoplanets into db
            Exoplanets.insertMany(exoplanets)
            .then(function () {
                console.log("Successfully saved items to DB");
              }).catch(function (err) {
                console.log(err);
              });
            console.log(`${exoplanets.length} + exoplanets have been successfully uploaded.`);
            return;
        });
}

main().catch((error) => {
    console.error(error);
    process.exit();
  });
