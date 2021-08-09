/* Legacy Modules */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
const compileSass = require('express-compile-sass');
(process.env.NODE_ENV === undefined || process.env.NODE_ENV !== 'production') ? require('dotenv').config({ silent: process.env.NODE_ENV !== 'development' }) : {}; // eslint-disable-line no-unused-expressions


/* Global Folder Aliasing */
require('app-module-path').addPath(`${__dirname}`);


/* Import Routes */
const usersRouter = require('routes/users');

/* Module Pre-Init */

// Initializing App
const app = express();


/* CORS Setup */
// const whitelist = JSON.parse(process.env.CORS_WHITELIST);
// const corsOptions = {
//   origin(origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       return callback(null, true);
//     }
//
//     return callback(new Error('Not allowed by CORS'), false);
//   }
// };
//
// app.use(cors(process.env.NODE_ENV === 'development' ? '' : corsOptions));


/* App Setup */

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Sass Middleware Setup
app.use(compileSass({
  root: path.join(__dirname, 'public/stylesheets'),
  sourceMap: true,
  sourceComments: true,
  watchFiles: true,
  logToConsole: false
}));

// Use legacy middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser(process.env.COOKIE_SECRET));
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false
// }));
app.use(favicon(path.join(__dirname, 'public', 'images', 'icons', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// CORS Pre-flight setup for all routes
app.options('*', cors());

// App Routing
app.use('/users', usersRouter);


/* 404 Handler */
app.use((req, res, next) => {
  res.render('error', {
    status: 404,
    stack: 'Not Found'
  });
  next();
});


/* Error Handler */
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/* Module Exports */
module.exports = app;
