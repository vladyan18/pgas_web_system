const mongoose = require('mongoose')

mongoose.connect('mongodb://bekhterev:bekhterev@localhost:27017/PGAS_PROD?authSource=admin', {useNewUrlParser: true})



const connection = mongoose.connection

connection.on('error', function () {
  console.log('Connect error')
})
connection.once('open', async function () {
  console.log('MongoDB successfully connected')
})

module.exports = connection
