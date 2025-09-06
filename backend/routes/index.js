import express from 'express';
const router = express.Router();

// GET home page
router.get('/', (req, res) => {
    // Pass the user object from the session to the template
    res.render('index', { title: 'Welcome to LegalFrame', user: req.session.user });
});

export default router;
