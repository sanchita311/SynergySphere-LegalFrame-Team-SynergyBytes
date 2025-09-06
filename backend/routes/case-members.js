import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET case members page
router.get('/cases/:id/members', async (req, res) => {
    try {
        const caseId = req.params.id;
        const userId = req.session.user.id;

        // Check if user has access to this case
        const [caseAccess] = await db.query(`
            SELECT c.*, cm.role_in_case 
            FROM cases c
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE c.case_id = ? AND (c.created_by = ? OR cm.user_id IS NOT NULL)
        `, [userId, caseId, userId]);

        if (caseAccess.length === 0) {
            return res.status(403).render('error', { 
                title: 'Access Denied', 
                message: 'You do not have access to this case' 
            });
        }

        // Get all members of this case
        const [members] = await db.query(`
            SELECT cm.*, u.first_name, u.last_name, u.email, u.role as user_role
            FROM case_members cm
            JOIN users u ON cm.user_id = u.user_id
            WHERE cm.case_id = ?
            ORDER BY cm.role_in_case, u.first_name
        `, [caseId]);

        // Get all users for adding new members
        const [allUsers] = await db.query(`
            SELECT user_id, first_name, last_name, email, role
            FROM users
            WHERE user_id NOT IN (
                SELECT user_id FROM case_members WHERE case_id = ?
            )
            ORDER BY first_name
        `, [caseId]);

        res.render('cases/members', {
            title: 'Case Members',
            caseItem: caseAccess[0],
            members: members,
            availableUsers: allUsers,
            currentUser: req.session.user
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).render('error', { 
            title: 'Error', 
            message: 'Error loading case members' 
        });
    }
});

// POST add member to case
router.post('/cases/:id/members', async (req, res) => {
    try {
        const caseId = req.params.id;
        const { user_id, role_in_case } = req.body;
        const userId = req.session.user.id;

        // Check if user has permission to add members (creator or lead)
        const [permission] = await db.query(`
            SELECT c.created_by, cm.role_in_case
            FROM cases c
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE c.case_id = ?
        `, [userId, caseId]);

        if (permission.length === 0) {
            return res.status(403).json({ error: 'Case not found' });
        }

        const isCreator = permission[0].created_by === userId;
        const isLead = permission[0].role_in_case === 'Lead';

        if (!isCreator && !isLead) {
            return res.status(403).json({ error: 'Not authorized to add members' });
        }

        // Add member to case
        await db.query(
            'INSERT INTO case_members (case_id, user_id, role_in_case) VALUES (?, ?, ?)',
            [caseId, user_id, role_in_case || 'Associate']
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// DELETE remove member from case
router.delete('/cases/:id/members/:memberId', async (req, res) => {
    try {
        const caseId = req.params.id;
        const memberId = req.params.memberId;
        const userId = req.session.user.id;

        // Check if user has permission to remove members
        const [permission] = await db.query(`
            SELECT c.created_by, cm.role_in_case
            FROM cases c
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE c.case_id = ?
        `, [userId, caseId]);

        if (permission.length === 0) {
            return res.status(403).json({ error: 'Case not found' });
        }

        const isCreator = permission[0].created_by === userId;
        const isLead = permission[0].role_in_case === 'Lead';

        if (!isCreator && !isLead) {
            return res.status(403).json({ error: 'Not authorized to remove members' });
        }

        // Remove member from case
        await db.query(
            'DELETE FROM case_members WHERE case_id = ? AND user_id = ?',
            [caseId, memberId]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

export default router;
