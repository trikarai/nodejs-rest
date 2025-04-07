const { validationResult } = require('express-validator');

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

    // Here you would typically save the post to a database
    // For now, we'll just return the created post as a response
    res.status(201).json({
        message: 'Post created successfully!',
        post: {
            _id: new Date().toISOString(), // Simulate an ID for the new post
            title: title,
            content: content,
            imageUrl: '/images/1743836947636-images.png', 
            creator: { name: 'Tri' }, 
            createdAt: new Date(), 
        },
    });
}