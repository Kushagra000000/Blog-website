require('dotenv').config();

//for debugging
const ejs = require('ejs');

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const routeHelpers = require('./server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT;

//debugging
console.log('*** Loading admin route file:', __filename);
console.log('*** process.env.ADMIN_HASH present?', Boolean(process.env.ADMIN_HASH));

//not required anymore
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  app.set('view cache', false);
  if (ejs.clearCache) ejs.clearCache();
  app.locals.cache = false;
  console.log('DEV MODE: view cache disabled');
} else {
  console.log('PROD MODE: view cache enabled');
}

// disable cache
if (isDev) {
  app.set('view cache', false);
}

// static files
app.use(express.static('public'));

// parse urlencoded form bodies ((for your search and admin forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
  // set this secure:true when finally using it
}));
app.locals.isActiveRoute = routeHelpers.isActiveRoute;

app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  res.locals.isAdmin = req.session && req.session.isAuth;
  next();
});

// Templating Engine
//recommend by youtube guide
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//all routes
app.use('/', require('./server/routes/main'));
app.use('/admin', require('./server/routes/admin'));

//listening on port (currently 3000)
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
