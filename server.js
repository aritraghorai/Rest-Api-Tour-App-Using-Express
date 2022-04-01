const mongoose = require('mongoose');
const dotenv = require('dotenv');
//*Uncought Exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
//*Strting The Tour
// console.log(process.env);
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
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
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port} ....`);
});

//*For Un handle  promice rejection like if database doesnot connect
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandle rejection shurting down');
  server.close(() => {
    process.exit(1);
  });
});
