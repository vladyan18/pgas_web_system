/** Main
 * @module main
 * @requires pagesRouter
 * @requires API
 */

const express = require('express');
const compress = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const passport = require('./config/passport'); // configuring passport here
// const redisClient = require('./config/redis');
const frontendPath = path.join(__dirname, '../frontend', '/build');
const port = 8080;

require('dotenv').config();
const app = express();
app.use(helmet());

//app.set('etag', false);
app.use(morgan('dev'));

const sess = {
  secret: '5c6a5cc5f3fd8718f419ff27',
  cookie: {},
  resave: false,
  HttpOnly: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}?authSource=admin`,
  }),
};


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));

app.use(compress());
app.use(express.static(path.join(frontendPath, '/public')));
app.use(express.static(path.join(__dirname, '/static/confirmations')));

if (process.env.ENV_T === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

const apiRoutes = require('./routes/api.js');
const pagesRoutes = require('./routes/pages.js');

app.use('/', apiRoutes);
app.use('/', pagesRoutes);


console.log(process.env.ENV_T);

app.listen(port, () => console.log('Server listening on port ' + port + ', good luck'));
