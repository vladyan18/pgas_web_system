/** Main
 * @module main
 * @requires pagesRouter
 * @requires API
 */

const express = require('express');
var compress = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const path = require('path');
const passport = require('./config/passport'); // configuring passport here
//const redisClient = require('./config/redis');
const frontendPath = path.join(__dirname, '../frontend', '/build');
const port = 8080;

require('dotenv').config();
const app = express();

app.set('etag', false);
app.use(morgan('dev'));


const sess = {
  secret: '5c6a5cc5f3fd8718f419ff27',
  cookie: {},
  resave: false,
  saveUninitialized: true,
    store: new MongoStore({
        url: 'mongodb://bekhterev:pgastest@mongo:27017/bekhterev?authSource=admin'
    })
};


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next()
});


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));

app.use(compress());
app.use(express.static(path.join(frontendPath, '/public')));
app.use(express.static(path.join(__dirname, '/static/confirmations')));

if (process.env.ENV_T == 'production') {
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

if (process.env.ENV_T == 'production') {
    sess.cookie.secure = true;

    app.use(function(req,resp,next){
        if (req.headers['x-forwarded-proto'] == 'http') {
            return resp.redirect(301, 'https://' + req.headers.host + '/');
        } else {
            return next();
        }
    });


    var http = require('http');
    var https = require('https');
    const fs = require('fs');
    var privateKey = fs.readFileSync(path.join(__dirname, '/ssl', 'privkey.pem'), 'utf8');
    var certificate = fs.readFileSync(path.join(__dirname, '/ssl', 'fullchain.pem'), 'utf');

    var credentials = {key: privateKey, cert: certificate};


    httpsServer = https.createSecureServer(credentials, app);

    http.createServer(app).listen(80);

    httpsServer.listen(443);
}
else
    app.listen(port, () => console.log('Server listening on port ' + port + ', good luck'));
