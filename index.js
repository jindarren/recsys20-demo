'use strict';

//const APIAI_TOKEN = '4b48fe544c5f435d8e325f450b26b5f9';
const APIAI_TOKEN = '1493bad763ec4671b1ee6ea4a8c80452';
const APIAI_SESSION_ID = '123456789abcdefghj';

const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    mongoose = require('mongoose');

var https = require('https')
    ,fs = require("fs");

var options = {
    key: fs.readFileSync('1644342_music-bot.top.key'),
    cert: fs.readFileSync('1644342_music-bot.top.pem')
};

const app = express();
var index = require('./routes/router');

mongoose.connect("mongodb://localhost:27017/bot", function (err) {
    if (err) {
        console.log("connection error", err);
    } else {
        console.log('connection successful!');
    }
});

app.use(express.static(__dirname + '/public')); // js, css, images
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('trust proxy', 1); // trust first proxy

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //cookie:{secure:true}
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', index);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

// const server = https.createServer(options, app).listen(3000, function () {
//     console.log('Https server listening on port ' + 3000);
// });

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai
    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    });

    apiaiReq.on('response', (response) => {
      //let aiText = response.result.fulfillment.speech;
      console.log('Bot reply: ' + response.result.fulfillment.speech);
      socket.emit('bot reply', response.result);
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});
