const mongoose = require('mongoose')

mongoose.connect(
  'mongodb://admin:adpass1@ds127624.mlab.com:27624/portfolio',
  { useNewUrlParser: true }
)

const connection = mongoose.connection

connection.on('error', function () {
  console.log('Connect error')
})
connection.once('open', async function () {
  console.log('MongoDB successfully connected')
})

module.exports = connection