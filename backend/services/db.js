import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'legalframe',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log('Database connection pool created.');

export default pool;
