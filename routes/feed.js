const express = require('express');
const { body } = require('express-validator'); // Import express-validator for validation
const router = express.Router();

const feedController = require('../controllers/feedController.js'); // Adjust the path as necessary

router.get('/', (req, res) => {
    feedController.getPosts(req, res);
});

// Route to get posts
// This will handle GET requests to /feed/posts
router.post("/post",
    [
        body('title').trim().isLength({ min: 5 }), // Validate title length
        body('content').trim().isLength({ min: 7 }), // Validate content length
        // body('imageUrl').trim().isURL(), // Validate image URL
    ]
    , feedController.createPost);
 
router.get('/post/:postId', feedController.getPostSingle); // Route to get single post

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }), // Validate title length
    body("content").trim().isLength({ min: 7 }), // Validate content length
  ],
  feedController.getUpdatePost
);

module.exports = router;