const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    process.env.JWT_SECRET = 'fallback_secret_key_for_development'; // Fallback for development
}

// Login page
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// Register page
router.get('/register', (req, res) => {
    res.render('register', { user: req.user });
});

// Register handle
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { 
                user: req.user, 
                error: 'Username already exists' 
            });
        }

        // Log registration attempt
        console.log('Attempting to register user:', username);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            username, 
            password: hashedPassword 
        });

        console.log('User created successfully:', user._id);
        console.log('JWT_SECRET is:', process.env.JWT_SECRET ? 'set' : 'not set'); // Debug log
        
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        // Log the full error
        console.error('Registration error:', error);
        
        res.render('register', { 
            user: req.user, 
            error: error.code === 11000 ? 'Username already taken' : 'Registration failed' 
        });
    }
});

// Login handle
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { user: req.user, error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        res.render('login', { user: req.user, error: 'Login failed' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router; 