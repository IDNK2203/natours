const dotenv = require('dotenv');
const dbConnection = require('./config/db');

process.on('uncaughtException', err => {
  // console.log(err.name, err.message);
  console.log(err);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config/config.env' });
const app = require('./index');

dbConnection();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('app is listening on port 3000 ');
});

// if (app.get('env') === 'production') {
process.on('unhandledRejection', err => {
  // console.log(err.name, err.message);
  console.log(err);

  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
// }
