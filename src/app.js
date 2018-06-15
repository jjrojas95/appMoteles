const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
require('dotenv').config();


// routes
const placesRoutes = require('./routes/places');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');


// Puerto e IP deploy
const port = process.env.PORT || 3000;
const ip = process.env.IP || null ;


// Connect database
mongoose.connect(config.database);
//On connect database
mongoose.connection.on('connected', () => {
  console.log(`Connected to database: ${config.database}`);
  });
//On error database
mongoose.connection.on('error', (err) => {
  console.log(`Connected to database: ${err}`);
  });


const app = express();


// CORS Middleware
app.use(cors());


// Set static folder
app.use(express.static(path.join(__dirname,'public')));


// Body Parser
app.use( bodyParser.json() );


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);


// Places routes
app.use('/places', placesRoutes);
// Register routes
app.use('/register', registerRoutes);
// Login routes
app.use('/', loginRoutes);



// Index route
app.get('/',(req,res) => {
  res.send('QUESO!!!');
});


// Inicio servidor
app.listen(port, ip, () => {
   console.log("Start server!!!!!");
});
