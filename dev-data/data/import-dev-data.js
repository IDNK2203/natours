const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tour');
const User = require('../../models/user');
const Review = require('../../models/review');

const connect = async () => {
  try {
    const connectValue = await mongoose.connect(
      'mongodb://localhost:27017/natours',
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: true,
        useCreateIndex: true
      }
    );
    console.log(`MONGODB CONNECTED:${connectValue.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connect();
// fetch data from file sysytem

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// import data to database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('tours imported');
  } catch (error) {
    console.log(error);
  }
  process.exit(1);
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('tours deleted');
    await Review.deleteMany();
    console.log('reviews deleted');
    await User.deleteMany();
    console.log('users deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit(1);
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
