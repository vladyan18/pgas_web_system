const mongoose = require('mongoose')

mongoose.connect('mongodb://bekhterev:pgastest@mongo:27017/bekhterev?authSource=admin', {useNewUrlParser: true})



const connection = mongoose.connection

connection.on('error', function () {
  console.log('Connect error')
})
connection.once('open', async function () {
  console.log('MongoDB successfully connected')
})

module.exports = connection
