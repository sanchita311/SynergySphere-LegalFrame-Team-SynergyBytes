import express from 'express';

const isAuthenticated = (req, res, next) => {
    // Check if the user is in the session
    if (req.session && req.session.user) {
        // If they are, let them through
        return next();
    }
    // If not, send them to the login page
    res.redirect('/auth/login');
};

export default isAuthenticated;

