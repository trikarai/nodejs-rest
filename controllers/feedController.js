const { validationResult } = require('express-validator');

const io = require('../socket'); // Import socket.io instance

const Post = require('../models/post'); // Import the Post model
const User = require('../models/user'); // Import the User model

const { clearImage } = require('../utils/image');

exports.getPosts = (req, res, next) => {

    const currentPage = req.query.page || 1; // Get the current page from query parameters, default to 1
    const limit = req.query.limit; // Number of posts per page  

    let totalItems = 0; // Initialize total items count
    
    Post.find() // Find all posts in the database
        .countDocuments() // Count the total number of posts
        .then(count => {
            totalItems = count; // Set the total items count
            return Post.find() // Find all posts again
                .populate('creator') // Populate the creator field with user data
                .skip((currentPage - 1) * limit) // Skip posts for previous pages
                .limit(limit); // Limit the number of posts to the specified limit
        })
        .then(posts => {
            res.status(200).json({ // Return success response
                message: 'Fetched posts successfully.',
                posts: posts, // Return the found posts,
                meta: {
                    totalItems: totalItems, // Return the total number of posts
                    page: currentPage, // Return the current page
                    limit: limit, // Return the limit of posts per page
                }
            });
        })
        .catch(err => {
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
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

    if (!req.file) { // Check if a file was uploaded
        const error = new Error('No image provided.'); // Create a new error
        error.statusCode = 422; // Set status code to 422 (Unprocessable Entity)
        throw error; // Throw the error to be handled by the error handling middleware
    }

    const imageUrl = req.file.path.replace("\\", "/"); // Get the file path and replace backslashes with forward slashes

    // Extract data from request body 
    const title = req.body.title; // Extract title from request body
    const content = req.body.content; // Extract content from request body

    const post = new Post({
      // Create a new post instance
      title: title,
      content: content,
      imageUrl: "/images/1743836947636-images.png", // Example image URL
      creator: req.userId, // Set the creator to the authenticated user ID 
      });

    let creator; // Initialize creator variable  

    post.save() // Save the post to the database
        .then(result => {
            return User.findById(req.userId); // Find the user by ID in the database
        })
        .then(user => {
            creator = user; // Set the creator to the found user
            user.posts.push(post); // Add the post to the user's posts array
            return user.save(); // Save the updated user to the database
        })
        .then(result => {

            io.getIO().emit('posts', { // Emit a socket event to notify all clients about the new post
                action: 'create', // Action type
                post: { // Post data to be sent to clients
                    ...post._doc, // Spread the post document properties
                    creator: { // Creator information
                        _id: creator._id,
                        name: creator.name,
                    },
                },
            });

            res.status(201).json({
              // Return success response
              message: "Post created successfully!",
              post: post, // Return the created post
              creator: {
                // Return the creator's information
                _id: creator._id,
                name: creator.name,
              },
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

exports.getUpdatePost = (req, res, next) => {
    const postId = req.params.postId; // Get the post ID from the request parameters
    let errors = validationResult(req); // Validate the request body
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.'); // Create a new error
        error.statusCode = 422; // Set status code to 422 (Unprocessable Entity)
        error.data = errors.array(); // Attach validation errors to the error object
        throw  error // Throw the error to be handled by the error handling middleware
    }

    const title = req.body.title; // Extract title from request body
    const content = req.body.content; // Extract content from request body
    let imageUrl = req.body.imageUrl; // Extract image URL from request body

    if (req.file) { // Check if a file was uploaded
        imageUrl = req.file.path.replace("\\", "/"); // Get the file path and replace backslashes with forward slashes
    }

    if (!imageUrl) { // Check if a file was uploaded
        const error = new Error('No image provided.'); // Create a new error
        error.statusCode = 422; // Set status code to 422 (Unprocessable Entity)
        throw error; // Throw the error to be handled by the error handling middleware
    }

    Post.findById(postId) // Find the post by ID in the database
        .populate('creator') // Populate the creator field with user data    
        .then(post => {
            if (!post) { // Check if post exists
                const error = new Error('Could not find post.'); // Create a new error
                error.statusCode = 404; // Set status code to 404 (Not Found)
                throw error; // Throw the error to be handled by the error handling middleware
            }

            if (post.creator.toString() !== req.userId.toString()) { // Check if the authenticated user is the creator of the post
                const error = new Error('Not authorized!'); // Create a new error
                error.statusCode = 403; // Set status code to 403 (Forbidden)
                throw error; // Throw the error to be handled by the error handling middleware
            }

            if(imageUrl !== post.imageUrl) { // Check if the image URL has changed
                clearImage(post.imageUrl); // Clear the old image from the server
            }
            post.title = title; // Update post title
            post.content = content; // Update post content
            post.imageUrl = imageUrl; // Update post image URL

            return post.save(); // Save the updated post to the database
        })
        .then(result => {

            io.getIO().emit("posts", {
              // Emit a socket event to notify all clients about the new post
              action: "update", // Action type
              post: result 
            });

            res.status(200).json({ // Return success response
                message: 'Post updated!',
                post: result, // Return the updated post
            });
        })
        .catch(err => {
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
        });
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId; // Get the post ID from the request parameters
    Post.findById(postId) // Find the post by ID in the database
        .then(post => {
            if (!post) { // Check if post exists
                const error = new Error('Could not find post.'); // Create a new error
                error.statusCode = 404; // Set status code to 404 (Not Found)
                throw error; // Throw the error to be handled by the error handling middleware
            }
            if (post.creator.toString() !== req.userId.toString()) {
                // Check if the authenticated user is the creator of the post
                const error = new Error("Not authorized!"); // Create a new error
                error.statusCode = 403; // Set status code to 403 (Forbidden)
                throw error; // Throw the error to be handled by the error handling middleware
            }

            clearImage(post.imageUrl); // Clear the image from the server
            return Post.findByIdAndDelete(postId); // Remove the post from the database
        })
        .then(result => {
            return User.findById(req.userId); // Find the user by ID in the database
        })
        .then(user => {
            user.posts.pull(postId); // Remove the post ID from the user's posts array
            return user.save(); // Save the updated user to the database
        })
        .then(result => {
            res.status(200).json({ // Return success response
                message: 'Post deleted.',
                postId: postId, // Return the deleted post ID
            });
        })
        .catch(err => {
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
        });
}