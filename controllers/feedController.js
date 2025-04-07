const { validationResult } = require('express-validator');

const Post = require('../models/post'); // Import the Post model
const User = require('../models/user'); // Import the User model

exports.getPosts = (req, res, next) => {
    res.status(200).json({
      posts: [
        {
          _id: "p1",
          title: "First Post",
          content: "This is the first post!",
          imageUrl: "/images/1743836947636-images.png", // Example image URL
          creator: { name: "Tri" }, // Example creator object
          createdAt: new Date(), // Example creation date
        },
        {
          _id: "p2",
          title: "Second Post",
          content: "This is the second post!",
          imageUrl: "/images/1743836947636-images.png",
          creator: { name: "Tri" }, // Example creator object
          createdAt: new Date(), // Example creation date
        },
      ],
    });
}

exports.createPost = (req, res) => {
    const errors = validationResult(req); // Validate the request body
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.'); // Create a new error
        error.statusCode = 422; // Set status code to 422 (Unprocessable Entity)
        error.data = errors.array(); // Attach validation errors to the error object
        throw  error // Throw the error to be handled by the error handling middleware
    }
    // Extract data from request body 
    const title = req.body.title; // Extract title from request body
    const content = req.body.content; // Extract content from request body

    const post = new Post({
      // Create a new post instance
      title: title,
      content: content,
      imageUrl: "/images/1743836947636-images.png", // Example image URL
      // creator: req.userId, // Assuming you have user authentication set up
      creator: "67c2eaf8cb97060c184e0fd0",  
    });

    post.save() // Save the post to the database
        .then(result => {
            res.status(201).json({ // Return success response
                message: 'Post created successfully!',
                post: result, // Return the created post
            });
        })
        .catch(err => {
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
        });
}

exports.getPostSingle = (req, res) => {
    const postId = req.params.postId; // Get the post ID from the request parameters
    Post.findById(postId) // Find the post by ID in the database
        .then(post => {
            if (!post) { // Check if post exists
                const error = new Error('Could not find post.'); // Create a new error
                error.statusCode = 404; // Set status code to 404 (Not Found)
                throw error; // Throw the error to be handled by the error handling middleware
            }
            res.status(200).json({ // Return success response
                message: 'Post fetched.',
                post: post, // Return the found post
            });
        })
        .catch(err => {
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
        });
}