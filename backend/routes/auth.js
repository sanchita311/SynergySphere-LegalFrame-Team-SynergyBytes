import express from 'express';
import bcrypt from 'bcrypt';
import db from '../services/db.js';

const router = express.Router();

// GET signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up', msg: null });
});

// POST signup form submission
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, phoneNumber } = req.body;
        
        if (!email || !password || !firstName || !lastName || !role || !phoneNumber) {
            return res.status(400).render('signup', { title: 'Sign Up', msg: 'Please enter all fields' });
        }

        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).render('signup', { title: 'Sign Up', msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO users (first_name, last_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', 
            [firstName, lastName, email, phoneNumber, hashedPassword, role]);

        res.redirect('/auth/login');

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', msg: null });
});

// POST login form submission
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).render('login', { title: 'Login', msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).render('login', { title: 'Login', msg: 'Invalid credentials' });
        }

        req.session.user = { id: user.user_id, email: user.email, role: user.role };
        res.redirect('/');

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});

export default router;
