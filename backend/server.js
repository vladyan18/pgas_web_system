/** Main
 * @module main
 * @requires pagesRouter
 * @requires API
 */

const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const passport = require('./config/passport'); // configuring passport here
const redisClient = require('./config/redis');
const frontendPath = path.join(__dirname, '../frontend', '/build');
const port = 80;
const http2 = require('http2');

require('dotenv').config();
const app = express();

app.set('etag', false);
app.use(morgan('dev'));


const sess = {
  secret: '5c6a5cc5f3fd8718f419ff27',
  cookie: {},
  resave: false,
  saveUninitialized: true,
    store: new (require('express-sessions'))({
        storage: 'redis',
        instance: redisClient
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


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(frontendPath, '/public')));
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


    http2Server = http2.createSecureServer(credentials, app);

    http.createServer(app).listen(80);

    http2Server.listen(443);
}
else
    app.listen(port, () => console.log('Example app listening on port ' + port));
