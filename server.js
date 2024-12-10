const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const auth = require('./backend/middleware/auth');
const Post = require('./backend/models/Post');
require('dotenv').config();

const app = express();

// Debug logging for paths
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Set view engine and paths
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Verify environment variables
console.log('Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'is set' : 'is not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'is set' : 'is not set');
console.log('PORT:', process.env.PORT);

// MongoDB connection
const mongoDBEndpoint = process.env.MONGODB_URI || 'mongodb://127.0.0.1/social_media_app';

mongoose.connect(mongoDBEndpoint, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected to:', mongoDBEndpoint.includes('mongodb+srv') ? 'Atlas' : 'Local');
})
.catch(err => {
    console.error('MongoDB Connection Error:', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('App Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Root route
app.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user').sort({ createdAt: -1 });
        res.render('home', { user: req.user, posts });
    } catch (error) {
        console.error('Error in root route:', error);
        res.render('home', { user: req.user, posts: [] });
    }
});

// Routes
app.use('/auth', require('./backend/routes/auth'));
app.use('/posts', require('./backend/routes/posts'));
app.use('/users', require('./backend/routes/users'));

// Debug route
app.get('/debug', (req, res) => {
    const fs = require('fs');
    const debugInfo = {
        cwd: process.cwd(),
        dirname: __dirname,
        files: fs.readdirSync(process.cwd()),
        env: process.env.NODE_ENV
    };
    res.json(debugInfo);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
}); 