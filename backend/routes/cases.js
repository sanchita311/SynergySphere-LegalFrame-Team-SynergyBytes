import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET cases list page
router.get('/cases', async (req, res) => {
    try {
        // Get user ID from session
        const userId = req.session.user.id;
        
        // Fetch cases created by the current user
        const [rows] = await db.query(
            'SELECT * FROM cases WHERE created_by = ? ORDER BY created_at DESC',
            [userId]
        );
        
        res.render('cases/list', { 
            title: 'Cases', 
            cases: rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).render('cases/list', { 
            title: 'Cases', 
            cases: [],
            error: 'Error loading cases'
        });
    }
});

// GET new case form
router.get('/cases/new', (req, res) => {
    res.render('cases/new', { 
        title: 'New Case',
        msg: null
    });
});

// POST create new case
router.post('/cases/new', async (req, res) => {
    try {
        const { title, description, status } = req.body;
        
        if (!title) {
            return res.status(400).render('cases/new', { 
                title: 'New Case', 
                msg: 'Case title is required' 
            });
        }

        // Get user ID from session
        const userId = req.session.user.id;

        // Insert new case into database
        await db.query(
            'INSERT INTO cases (title, description, status, created_by) VALUES (?, ?, ?, ?)',
            [title, description || '', status || 'Active', userId]
        );

        res.redirect('/cases');

    } catch (err) {
        console.error(err.message);
        res.status(500).render('cases/new', { 
            title: 'New Case', 
            msg: 'Server Error - Please try again' 
        });
    }
});

export default router;
