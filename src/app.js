const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');


// Models
const Place = require('./models/place');
const User = require('./models/user');
const Comment = require("./models/comment");

require('dotenv').config();


// routes
const placesRoutes = require('./routes/places');
const placesAPIRoutes = require('./routes/placesAPI');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const resetRoutes = require('./routes/resetPassword');
const registerAdminRoutes = require('./routes/registerAdmin');
const registerSuperAdminRoutes = require('./routes/registerSuperAdmin');
const commentRoutes = require('./routes/comment');
const userRoutes = require('./routes/user');



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

mongoose.Promise = global.Promise;


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


//Places routes
app.use('/places', placesRoutes);
//Places API Route
app.use('/places/:id', placesAPIRoutes);
//comment places route
app.use('/places/:id/comment', commentRoutes);
// Register routes
app.use('/register', registerRoutes);
// Register admin route
app.use('/register/admin', registerAdminRoutes);
// Register SuperAdmin route
app.use('/register/superAdmin', registerSuperAdminRoutes);
// User routes
app.use('/user', userRoutes);
// Login routes
app.use('', loginRoutes);
// Reset password routes
app.use('/reset', resetRoutes);





// Index route
app.get('/',(req,res) => {
  res.send('QUESO!!!');
});

// Inicio servidor
app.listen(port, ip, () => {
   console.log("Start server!!!!!");
});
