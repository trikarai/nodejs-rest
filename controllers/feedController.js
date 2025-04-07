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
        return res.status(422).json({ 
            message: 'Validation failed, entered data is incorrect.',
            errors: errors.array() 
        }); // Return validation errors
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
            res.status(500).json({ message: 'Creating a post failed!' }); // Return error response
        });
}