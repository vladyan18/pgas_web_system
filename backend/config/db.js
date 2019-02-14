const mongoose = require('mongoose')

mongoose.connect(
    'mongodb://user:1password@ds026018.mlab.com:26018/vit',
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