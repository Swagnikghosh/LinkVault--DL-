const mongoose = require('mongoose');

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
const connectDb = async () => {
  try {
    const connect = await mongoose.connect(DB);
    console.log(
      `Database connected!\nHost: ${connect.connection.host}\nName: ${connect.connection.name}`,
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDb;
