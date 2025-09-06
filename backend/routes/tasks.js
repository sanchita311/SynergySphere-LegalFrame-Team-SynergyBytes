import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET tasks for a case (Kanban board)
router.get('/cases/:id/tasks', async (req, res) => {
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

        // Get all tasks for this case
        const [tasks] = await db.query(`
            SELECT t.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as assignee_name,
                   u.email as assignee_email
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.user_id
            WHERE t.case_id = ?
            ORDER BY t.priority DESC, t.created_at ASC
        `, [caseId]);

        // Get case members for assignment
        const [members] = await db.query(`
            SELECT u.user_id, u.first_name, u.last_name, u.email
            FROM case_members cm
            JOIN users u ON cm.user_id = u.user_id
            WHERE cm.case_id = ?
            ORDER BY u.first_name
        `, [caseId]);

        // Group tasks by status
        const tasksByStatus = {
            'To Do': tasks.filter(task => task.status === 'To Do'),
            'In Progress': tasks.filter(task => task.status === 'In Progress'),
            'Blocked': tasks.filter(task => task.status === 'Blocked'),
            'Done': tasks.filter(task => task.status === 'Done')
        };

        res.render('cases/tasks', {
            title: 'Case Tasks',
            caseItem: caseAccess[0],
            tasks: tasksByStatus,
            members: members,
            currentUser: req.session.user
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).render('error', { 
            title: 'Error', 
            message: 'Error loading tasks' 
        });
    }
});

// POST create new task
router.post('/cases/:id/tasks', async (req, res) => {
    try {
        const caseId = req.params.id;
        const { title, description, assignee_id, priority, due_date } = req.body;
        const userId = req.session.user.id;

        // Check if user has access to this case
        const [caseAccess] = await db.query(`
            SELECT c.*, cm.role_in_case 
            FROM cases c
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE c.case_id = ? AND (c.created_by = ? OR cm.user_id IS NOT NULL)
        `, [userId, caseId, userId]);

        if (caseAccess.length === 0) {
            return res.status(403).json({ error: 'Not authorized to create tasks for this case' });
        }

        if (!title) {
            return res.status(400).json({ error: 'Task title is required' });
        }

        // Create task
        await db.query(
            'INSERT INTO tasks (case_id, title, description, assignee_id, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [caseId, title, description || '', assignee_id || null, priority || 'Medium', due_date || null]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT update task status
router.put('/tasks/:id/status', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;
        const userId = req.session.user.id;

        // Check if user has access to this task
        const [taskAccess] = await db.query(`
            SELECT t.*, c.created_by, cm.role_in_case
            FROM tasks t
            JOIN cases c ON t.case_id = c.case_id
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE t.task_id = ? AND (c.created_by = ? OR cm.user_id IS NOT NULL)
        `, [userId, taskId, userId]);

        if (taskAccess.length === 0) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }

        // Update task status
        await db.query(
            'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?',
            [status, taskId]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT update task
router.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, description, assignee_id, priority, due_date, status } = req.body;
        const userId = req.session.user.id;

        // Check if user has access to this task
        const [taskAccess] = await db.query(`
            SELECT t.*, c.created_by, cm.role_in_case
            FROM tasks t
            JOIN cases c ON t.case_id = c.case_id
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE t.task_id = ? AND (c.created_by = ? OR cm.user_id IS NOT NULL)
        `, [userId, taskId, userId]);

        if (taskAccess.length === 0) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }

        // Update task
        await db.query(
            'UPDATE tasks SET title = ?, description = ?, assignee_id = ?, priority = ?, due_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?',
            [title, description, assignee_id, priority, due_date, status, taskId]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// DELETE task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.session.user.id;

        // Check if user has access to this task
        const [taskAccess] = await db.query(`
            SELECT t.*, c.created_by, cm.role_in_case
            FROM tasks t
            JOIN cases c ON t.case_id = c.case_id
            LEFT JOIN case_members cm ON c.case_id = cm.case_id AND cm.user_id = ?
            WHERE t.task_id = ? AND (c.created_by = ? OR cm.user_id IS NOT NULL)
        `, [userId, taskId, userId]);

        if (taskAccess.length === 0) {
            return res.status(403).json({ error: 'Not authorized to delete this task' });
        }

        // Delete task
        await db.query('DELETE FROM tasks WHERE task_id = ?', [taskId]);

        res.json({ success: true });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

export default router;
