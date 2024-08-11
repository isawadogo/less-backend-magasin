require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('./models/connection');
const auth = require('./modules/auth');

var indexRouter = require('./routes/index');
var enseigne1Router = require('./routes/enseigne1');
var enseigne2Router = require('./routes/enseigne2');
var enseigne3Router = require('./routes/enseigne3');
var enseigne4Router = require('./routes/enseigne4');
var enseigneRouter = require('./routes/enseigne');
var produitRouter = require('./routes/produit');

var app = express();

const cors = require('cors');
app.use(cors());

const helmet = require('helmet');
app.use(helmet());

app.use(auth);
//app.use(logger('dev'));
app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/enseigne1', enseigne1Router);
app.use('/enseigne2', enseigne2Router);
app.use('/enseigne3', enseigne3Router);
app.use('/enseigne4', enseigne4Router);
app.use('/enseigne', enseigneRouter);
app.use('/produit', produitRouter);

module.exports = app;
