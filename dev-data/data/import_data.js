const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { dirname } = require('path');
dotenv.config({ path: '../../config.env' });
//*Strting The Tour
// console.log(process.env);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const Tour = require('./../../Model/tourModel');
// console.log(DB);
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(DB, connectionParams)
  .then(() => {
    // console.log(con.connection);
    console.log('Connected to database ');
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
const data = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`),
  'utf-8'
);
const importData = async () => {
  try {
    await Tour.create(data);
    console.log('File Import Successfully');
  } catch (error) {
    console.log('Error', error);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('File Delete Successfully');
  } catch (error) {
    console.log('Error', error);
  }
  process.exit();
};
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
