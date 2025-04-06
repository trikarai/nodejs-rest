const express = require('express');
const router = express.Router();

const feedController = require('../controllers/feedController.js'); // Adjust the path as necessary

router.get('/', (req, res) => {
    feedController.getPosts(req, res);
});

// Route to get posts
// This will handle GET requests to /feed/posts
router.post("/post", feedController.createPost);
 
module.exports = router;