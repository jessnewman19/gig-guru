const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Developer = require('../../models/developerModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection successful');
  });

//READ JSON FILE
const developers = JSON.parse(
  fs.readFileSync(`${__dirname}/developers.json`, 'utf-8')
);

//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Developer.create(developers);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Developer.deleteMany();
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
