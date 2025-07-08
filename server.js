// Import Core Modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
require('dotenv').config();

// Initialize App
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'spare-parts-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use(flash());

// Custom Middleware
const passUserToView = require('./middleware/pass-user-to-view');
app.use(passUserToView);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const sparePartsRoutes = require('./routes/sparePartsRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Mount Routes
app.use('/auth', authRoutes);
app.use('/spare-parts', sparePartsRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Redirects for Login/Register (GET only)
app.get('/login', (req, res) => res.redirect('/auth/login'));
app.get('/register', (req, res) => res.redirect('/auth/register'));

// Dynamic Home Page — shows latest spare parts
const SparePart = require('./models/SparePart');
app.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.render('home', {
        title: 'AutoParts Pro - Professional Automotive Marketplace',
        recentParts: [],
        dbError: 'Database connection is not available. Please try again later.'
      });
    }

    const recentParts = await SparePart.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('carModel carType partLocation owner');
    
    res.render('home', {
      title: 'AutoParts Pro - Professional Automotive Marketplace',
      recentParts
    });
  } catch (err) {
    console.error('Error fetching recent parts:', err);
    res.render('home', {
      title: 'AutoParts Pro - Professional Automotive Marketplace',
      recentParts: [],
      dbError: 'Unable to load recent parts. Please try again later.'
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('errors/404', { 
    title: 'Page Not Found',
    url: req.originalUrl 
  });
});

// 500 Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500', { 
    title: 'Server Error',
    error: err 
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
