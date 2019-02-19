const express = require('express')
const morgan = require('morgan')
const path = require('path')
const userController = require(path.join(__dirname, 'controllers/userController.js'))

const frontendPath = path.join(__dirname, '../frontend', '/build')
const port = 3004 

const app = express()

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.set("view engine", "ejs")
app.use(morgan('dev'))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(frontendPath, '/public')))

app.get('*', function(req,res){
    res.sendFile(frontendPath + '/add.html')
})

app.post('/add_achieve', userController.addAchieve)

app.post('/balls', userController.balls)

app.post('/delete', userController.delete)

app.listen(port, () => console.log('Example app listening on port ' + port))