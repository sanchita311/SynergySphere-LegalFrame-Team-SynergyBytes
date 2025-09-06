import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET cases list page
router.get('/cases', async (req, res) => {
    try {
        // Get user ID from session
        const userId = req.session.user.id;
        
        // Fetch cases where user is either creator or member
        const [rows] = await db.query(`
            SELECT DISTINCT c.*, 
                   GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as members
            FROM cases c
            LEFT JOIN case_members cm ON c.case_id = cm.case_id
            LEFT JOIN users u ON cm.user_id = u.user_id
            WHERE c.created_by = ? OR c.case_id IN (
                SELECT case_id FROM case_members WHERE user_id = ?
            )
            GROUP BY c.case_id
            ORDER BY c.created_at DESC
        `, [userId, userId]);
        
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
        msg: null,
        msgType: null
    });
});

// POST create new case
router.post('/cases/new', async (req, res) => {
    try {
        const { title, description, status, due_date } = req.body;
        
        if (!title) {
            return res.status(400).render('cases/new', { 
                title: 'New Case', 
                msg: 'Case title is required',
                msgType: 'danger'
            });
        }

        // Get user ID from session
        const userId = req.session.user.id;

        // Insert new case into database
        const [result] = await db.query(
            'INSERT INTO cases (title, description, status, due_date, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, description || '', status || 'Active', due_date || null, userId]
        );

        // Get the inserted case ID (for UUID, we need to query the inserted record)
        const [insertedCase] = await db.query(
            'SELECT case_id FROM cases WHERE created_by = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        
        const caseId = insertedCase[0].case_id;

        // Add creator as Lead member
        await db.query(
            'INSERT INTO case_members (case_id, user_id, role_in_case) VALUES (?, ?, ?)',
            [caseId, userId, 'Lead']
        );

        res.redirect('/cases');

    } catch (err) {
        console.error(err.message);
        res.status(500).render('cases/new', { 
            title: 'New Case', 
            msg: 'Server Error - Please try again',
            msgType: 'danger'
        });
    }
});

// DELETE case
router.delete('/cases/:id', async (req, res) => {
    try {
        const caseId = req.params.id;
        const userId = req.session.user.id;

        // Check if user is the creator of the case
        const [caseRows] = await db.query(
            'SELECT created_by FROM cases WHERE case_id = ?',
            [caseId]
        );

        if (caseRows.length === 0) {
            return res.status(404).json({ error: 'Case not found' });
        }

        if (caseRows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this case' });
        }

        // Delete case (cascade will handle case_members and tasks)
        await db.query('DELETE FROM cases WHERE case_id = ?', [caseId]);

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// API route to get available users for a case
router.get('/api/cases/:id/available-users', async (req, res) => {
    try {
        const caseId = req.params.id;
        
        // Get all users not already in this case
        const [users] = await db.query(`
            SELECT user_id, first_name, last_name, email, role
            FROM users
            WHERE user_id NOT IN (
                SELECT user_id FROM case_members WHERE case_id = ?
            )
            ORDER BY first_name
        `, [caseId]);
        
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// API route to get case members
router.get('/api/cases/:id/members', async (req, res) => {
    try {
        const caseId = req.params.id;
        
        // Get all members of this case
        const [members] = await db.query(`
            SELECT cm.user_id, u.first_name, u.last_name, u.email
            FROM case_members cm
            JOIN users u ON cm.user_id = u.user_id
            WHERE cm.case_id = ?
            ORDER BY u.first_name
        `, [caseId]);
        
        res.json(members);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

export default router;
