# AutoParts Pro - Professional Automotive Marketplace

A full-stack Node.js web application for managing automotive spare parts with user authentication, admin functionality, and image uploads.

## Features

- User registration and login with secure password hashing
- Spare parts marketplace with CRUD operations
- Image upload functionality for parts
- Admin dashboard for user and parts management
- Role-based access control (admin/user)
- Password reset functionality via email
- Responsive Bootstrap UI with professional styling
- Local MongoDB database integration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates, Bootstrap 5, Font Awesome
- **Authentication**: bcrypt, express-session
- **File Upload**: Multer
- **Email**: Nodemailer

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Local MongoDB installation
- Git

### Installation

1. **Extract and navigate to the project**
   ```bash
   # Extract the downloaded zip file
   cd autoparts-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` (if exists) or create `.env` file
   - Update the following environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/autoparts_pro
   SESSION_SECRET=your_secure_session_secret_here
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PORT=5000
   NODE_ENV=development
   ```

4. **MongoDB Setup**
   - Install MongoDB locally (see MONGODB_SETUP.md for detailed instructions)
   - Make sure MongoDB is running on port 27017
   - The database will be created automatically when you run the seed script

5. **Database Setup**
   ```bash
   # Seed the database with initial data
   node seed.js
   ```

6. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   # OR
   npx nodemon server.js
   
   # Production mode
   npm start
   ```

7. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## Default Test Accounts

After seeding the database, you can use these accounts:

- **Admin**: admin@spareparts.com / admin123
- **User**: user@spareparts.com / user123


## Current Project Structure
```
├──controllers/           # Application logic
│   ├── adminController.js
│   ├── authController.js  
│   ├── sparePartController.js
│   └── users.js
├──middleware/           # Custom middleware
│   ├── authMiddleware.js
│   ├── pass-user-to-view.js
│   └── uploadMiddleware.js
├──models/              # Database schemas
│   ├── CarModel.js
│   ├── CarType.js
│   ├── PartLocation.js
│   ├── SparePart.js
│   └── User.js
├──routes/             # Route definitions
│   ├── adminRoutes.js
│   ├── apiRoutes.js
│   ├── authRoutes.js
│   ├── sparePartsRoutes.js
│   └── userRoutes.js
├──views/              # EJS templates
│   ├── admin/
│   ├── auth/
│   ├── errors/
│   ├── partials/
│   ├── spare-parts/
│   ├── users/
│   └── home.ejs
├──public/             # Static assets
│   ├── css/style.css
│   └── uploads/        # User uploaded images
├──   node_modules/       # Dependencies (auto-generated)
├──.env               # Environment variables
├──package.json       # Dependencies & scripts
├──package-lock.json  # Dependency lock file
├──README.md          # Setup instructions
├──seed.js           # Database seeding
└──server.js         # Main application
```
## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with initial data

## Key Routes

- `/` - Homepage with recent parts
- `/auth/register` - User registration
- `/auth/login` - User login
- `/spare-parts` - Browse all parts
- `/spare-parts/new` - Add new part (authenticated)
- `/admin/dashboard` - Admin dashboard (admin only)
- `/users/profile` - User profile management
