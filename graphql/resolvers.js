const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const validator = require("validator"); // Import validator for input validation
const User = require('../models/user'); // Import the User model to interact with the database
const Post = require('../models/post'); // Import the Post model to interact with the database
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for generating JWT tokens

// This file contains the resolvers for the GraphQL API.
// It defines the structure of the API and how to resolve queries and mutations.
const rootValue = {
  createUser: async (args, { req }) => {
    try {
      // Validate the email and password using validator library
      const errors = []; // Initialize an array to store validation errors
      if (!validator.isEmail(args.userInput.email)) {
        errors.push({ message: "Email is invalid!" }); // Add an error if the email is invalid
      }
      if (
        validator.isEmpty(args.userInput.password) ||
        !validator.isLength(args.userInput.password, { min: 5 })
      ) {
        errors.push({ message: "Password is invalid!" }); // Add an error if the password is invalid
      }
      if (errors.length > 0) {
        const error = new Error("Invalid input!"); // Create an error if there are validation errors
        error.data = errors; // Attach the validation errors to the error object
        error.code = 422; // Set the error code to 422 (Unprocessable Entity)
        throw error; // Throw the error to be caught by the GraphQL handler
      }

      // Check if a user with the same email already exists
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        const error = new Error("User already exists!"); // Create an error if the user already exists
        error.code = 422; // Set the error code to 422 (Unprocessable Entity)
        throw error; // Throw the error to be caught by the GraphQL handler
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      // Create a new user object
      const user = new User({
        email: args.userInput.email,
        name: args.userInput.name,
        password: hashedPassword,
      });

      // Save the user to the database
      const createdUser = await user.save();

      // Return the created user object
      return { ...createdUser._doc, _id: createdUser._id.toString() };
    } catch (err) {
      console.log(err); // Log any errors that occur during the process
      throw err; // Throw the error to be caught by the GraphQL handler
    }
  },
  login : async function({email, password }) {
    const user = await User.findOne({ email: email }) // Find the user by email
    if(!user) {
      const error = new Error("User not found!"); // Create an error if the user is not found
      error.code = 401; // Set the error code to 401 (Unauthorized)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    const isEqual = await bcrypt.compare(password, user.password); // Compare the provided password with the hashed password
    if(!isEqual) {
      const error = new Error("Password is incorrect!"); // Create an error if the password is incorrect
      error.code = 401; // Set the error code to 401 (Unauthorized)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email }, // Create a JWT token with the user ID and email
      process.env.JWT_SECRET_KEY, // Use the secret key from environment variables
      { expiresIn: "1h" } // Set the token expiration time to 1 hour
    );
    return { userId: user._id.toString(), token: token }; // Return the user ID, token, and token expiration time
  },
  createPost: async (args, { req }) => {
    const errors = []; // Initialize an array to store validation errors
    if(validator.isEmpty(args.postInput.title) || !validator.isLength(args.postInput.title, { min: 5 })) {
      errors.push({ message: "Title is invalid!" }); // Add an error if the title is invalid // Add an error if the title is invalid
    }    
    if(validator.isEmpty(args.postInput.content) || !validator.isLength(args.postInput.content, { min: 5 })) {
      errors.push({ message: "Content is invalid!" }); // Add an error if the content is invalid // Add an error if the content is invalid
    }
    if(errors.length > 0) { // Create an error if there are validation errors
      const error = new Error("Invalid input!"); // Create an error if there are validation errors // Attach the validation errors to the error object
      error.data = errors; // Attach the validation errors to the error object // Set the error code to 422 (Unprocessable Entity)
      error.code = 422; // Set the error code to 422 (Unprocessable Entity) // Throw the error to be caught by the GraphQL handler
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    if (!req.isAuth) {
      const error = new Error("Not authenticated!"); // Create an error if the user is not authenticated
      error.code = 401; // Set the error code to 401 (Unauthorized)
      throw error; // Throw the error to be caught by the GraphQL handler
    }

    const user = await User.findById(req.userId); // Find the user who created the post
    if (!user) {
      const error = new Error("User not found!"); // Create an error if the user is not found
      error.code = 404; // Set the error code to 404 (Not Found)
      throw error; // Throw the error to be caught by the GraphQL handler
    }

    const post = new Post({
      title: args.postInput.title,
      content: args.postInput.content,
      imageUrl: args.postInput.imageUrl,
      creator: req.userId, // Set the creator to the authenticated user's ID
    });
    const createdPost = await post.save(); // Save the post to the database
    
    user.posts.push(createdPost); // Add the created post to the user's posts array
    await user.save(); // Save the updated user to the database
    return { ...createdPost._doc, _id: createdPost._id.toString(), createdAt: createdPost.updatedAt.toISOString() }; // Return the created post object
  },
  posts: async (args, { req }) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!"); // Create an error if the user is not authenticated
      error.code = 401; // Set the error code to 401 (Unauthorized)
      throw error; // Throw the error to be caught by the GraphQL handler
    }

    const page = +args.page || 1; // Get the page number from the arguments or default to 1
    const perPage = 2; // Number of posts per page

    const totalPosts = await Post.find().countDocuments(); // Get the total number of posts in the database
    const posts = await Post.find()
    .sort({ createdAt: -1 }) // Sort the posts by creation date in descending order
    .skip((page - 1) * perPage) // Skip the posts for the previous pages
    .limit(perPage) // Limit the number of posts to the perPage value
    .populate("creator"); // Find all posts and populate the creator field with user data

    return { 
      posts: posts.map((post) => (
        { 
          ...post._doc, 
          _id: post._id.toString(), 
          createdAt: post.createdAt.toISOString(), 
          updatedAt: post.updatedAt.toISOString() })), 
          totalPosts: totalPosts,
          page: page,

  
    }; // Return the posts and total number of posts
  },
  post: async (args, { req }) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!"); // Create an error if the user is not authenticated
      error.code = 401; // Set the error code to 401 (Unauthorized)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    const post = await Post.findById(args.postId).populate("creator"); // Find the post by ID and populate the creator field with user data
    if (!post) {
      const error = new Error("Post not found!"); // Create an error if the post is not found
      error.code = 404; // Set the error code to 404 (Not Found)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    return { ...post._doc, _id: post._id.toString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() }; // Return the post object
  },
  updatePost: async (args, { req }) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!"); // Create an error if the user is not authenticated
      error.code = 401; // Set the error code to 401 (Unauthorized)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    const post = await Post.findById(args.postId).populate("creator"); // Find the post by ID and populate the creator field with user data
    if (!post) {
      const error = new Error("Post not found!"); // Create an error if the post is not found
      error.code = 404; // Set the error code to 404 (Not Found)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!"); // Create an error if the user is not authorized to update the post
      error.code = 403; // Set the error code to 403 (Forbidden)
      throw error; // Throw the error to be caught by the GraphQL handler
    }
    const errors = []; // Initialize an array to store validation errors
    if(validator.isEmpty(args.postInput.title) || !validator.isLength(args.postInput.title, { min: 5 })) {
      errors.push({ message: "Title is invalid!" }); // Add an error if the title is invalid
    }    
    if(validator.isEmpty(args.postInput.content) || !validator.isLength(args.postInput.content, { min: 5 })) {
      errors.push({ message: "Content is invalid!" }); // Add an error if the content is invalid
    }
    if(errors.length > 0) { // Create an error if there are validation errors
      const error = new Error("Invalid input!"); // Create an error if there are validation errors
      error.data = errors; // Attach the validation errors to the error object
      error.code = 422; // Set the error code to 422 (Unprocessable Entity)
      throw error; // Throw the error to be caught by the GraphQL handler
    }

    post.title = args.postInput.title; // Update the post title
    post.content = args.postInput.content; // Update the post content
    if (args.postInput.imageUrl !== "undefined") {
      post.imageUrl = args.postInput.imageUrl; // Update the post image URL if provided
    }
    const updatedPost = await post.save(); // Save the updated post to the database
    return { ...updatedPost._doc, _id: updatedPost._id.toString(), createdAt: updatedPost.createdAt.toISOString(), updatedAt: updatedPost.updatedAt.toISOString() }; // Return the updated post object
  }
};

// The rootValue object contains the resolvers for the GraphQL API
// Each key in the object corresponds to a field in the GraphQL schema
module.exports = { rootValue };
