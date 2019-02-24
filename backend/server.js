const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const path = require('path')
const passport = require('./config/passport') // configuring passport here

const frontendPath = path.join(__dirname, '../frontend', '/build')
const port = 8080

const app = express()


app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

app.set("view engine", "ejs")



const sess = {
  secret: '5c6a5cc5f3fd8718f419ff27',
  cookie: {},
  resave: false,
  saveUninitialized: true
}


app.use(morgan('dev'))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

if (app.get('env') === 'production') {
    //sess.cookie.secure = true;
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(frontendPath, '/public')))
app.use(session(sess))
app.use(passport.initialize())
app.use(passport.session())

const apiRoutes = require('./routes/api.js')
const pagesRoutes = require('./routes/pages.js')

app.use('/', apiRoutes)
app.use('/', pagesRoutes)

app.listen(port, () => console.log('Example app listening on port ' + port))
