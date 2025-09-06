import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './services/db.js'; // Import your database connection
import mainRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import isAuthenticated from './middleware/auth.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 


// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse request bodies for forms and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // FIX: Added to parse form data

// Cookie Parser Middleware
app.use(cookieParser());

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS in production
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the routes
app.use('/auth', authRoutes); // Auth routes should be accessible without authentication
app.use('/', isAuthenticated, mainRoutes); // Main routes require authentication

// Start the server and check database connection
app.listen(PORT, async () => {
    try {
        await db.getConnection();
        console.log('Successfully connected to the database.');
    } catch (err) {
        console.error('Failed to connect to the database:', err.message);
    }
    console.log(`Server is running on http://localhost:${PORT}`);
});