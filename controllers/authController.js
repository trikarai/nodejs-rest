require("dotenv").config();
const User = require('../models/user'); // Import the User model
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
 
exports.login = async (req, res, next) => {
    const errors = validationResult(req); // Validate the request body
    if (!errors.isEmpty()) { // Check if there are validation errors
        const error = new Error('Validation failed, entered data is incorrect.'); // Create a new error
        error.statusCode = 422; // Set status code to 422 (Unprocessable Entity)
        error.data = errors.array(); // Attach validation errors to the error object
        throw error; // Throw the error to be handled by the error handling middleware
    }
    
    const { email, password } = req.body; // Destructure email and password from request body
    
    let loadedUser; // Initialize variable to hold loaded user

    User.findOne({ email: email }) // Find user by email in the database
        .then(user => {
            if (!user) { // If user not found
                const error = new Error('A user with this email could not be found.'); // Create a new error
                error.statusCode = 401; // Set status code to 401 (Unauthorized)
                throw error; // Throw the error to be handled by the error handling middleware
            }
            loadedUser = user; // Assign found user to loadedUser variable
            return bcrypt.compare(password, user.password); // Compare provided password with hashed password in database
        })
        .then(isEqual => {
            if (!isEqual) { // If passwords do not match
                const error = new Error('Wrong password!'); // Create a new error
                error.statusCode = 401; // Set status code to 401 (Unauthorized)
                throw error; // Throw the error to be handled by the error handling middleware
            }
            const token = jwt.sign(
              // Generate a JWT token
              {
                email: loadedUser.email, // Include email in token payload
                userId: loadedUser._id.toString(), // Include user ID in token payload
              },
              process.env.JWT_SECRET_KEY, // Secret key for signing the token
              { expiresIn: process.env.JWT_EXPIRATION_TIME } // Set token expiration time to 1 hour
            );
            res.status(200).json({ // Return success response
                message: 'Logged in successfully!',
                userId: loadedUser._id.toString(), // Return the user ID as a string
                token: token, // Return the generated token
            });
        })
        .catch(err => { // Catch any errors
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
        });
}

exports.signup = async (req, res) => {
    const errors = validationResult(req); // Validate the request body
    if (!errors.isEmpty()) { // Check if there are validation errors
        const error = new Error('Validation failed, entered data is incorrect.'); // Create a new error
        error.statusCode = 422; // Set status code to 422 (Unprocessable Entity)
        error.data = errors.array(); // Attach validation errors to the error object
        throw error; // Throw the error to be handled by the error handling middleware
    }
     
    const { name, email, password } = req.body; // Destructure name, email and password from request body
     
    bcrypt.hash(password, 12) // Hash the password with a salt round of 12
        .then(hashedPassword => { // Hashing successful
            const user = new User({ // Create a new user object
                name: name,
                email: email,
                password: hashedPassword, // Use the hashed password
                status: 'I am new!', // Default status
                posts: [], // Empty posts array
            });
            return user.save(); // Save the user to the database
        })
        .then(result => { // User saved successfully
            res.status(201).json({ // Return success response
                message: 'User created successfully!',
                userId: result._id.toString(), // Return the user ID as a string
            });
        })
        .catch(err => { // Catch any errors
            if (!err.statusCode) { // Check if error has a status code
                err.statusCode = 500; // Set default status code to 500
            }
            next(err); // Pass the error to the next middleware
        });
}