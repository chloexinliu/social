const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

router.get('/:username', async (req, res) => {
    try {
        const profileUser = await User.findOne({ username: req.params.username });
        if (!profileUser) {
            return res.redirect('/');
        }

        const posts = await Post.find({ user: profileUser._id })
            .populate('user')
            .sort({ createdAt: -1 });

        res.render('profile', {
            user: req.user,
            profileUser,
            posts,
            isOwnProfile: req.user && req.user._id.toString() === profileUser._id.toString()
        });
    } catch (error) {
        res.redirect('/');
    }
});

// Update profile description
router.post('/:username/update-description', async (req, res) => {
    try {
        if (!req.user || req.user.username !== req.params.username) {
            return res.redirect('/');
        }

        await User.findByIdAndUpdate(req.user._id, {
            description: req.body.description
        });

        res.redirect(`/users/${req.params.username}`);
    } catch (error) {
        res.redirect('/');
    }
});

module.exports = router; 