const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Create post
router.post('/create', async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/login');
        }
        
        const post = await Post.create({
            content: req.body.content,
            user: req.user._id
        });
        
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

// Edit post
router.post('/edit/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/login');
        }
        
        const post = await Post.findById(req.params.id);
        if (!post || post.user.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        
        post.content = req.body.content;
        await post.save();
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

// Delete post
router.post('/delete/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/login');
        }
        
        const post = await Post.findById(req.params.id);
        if (!post || post.user.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        
        await post.deleteOne();
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});

module.exports = router; 