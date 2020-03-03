const mongoose = require('mongoose');

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}?authSource=admin`, {useNewUrlParser: true});



const connection = mongoose.connection;

connection.on('error', function () {
  console.log('Connect error')
});
connection.once('open', async function () {
  console.log('MongoDB successfully connected')
});

module.exports = connection;
