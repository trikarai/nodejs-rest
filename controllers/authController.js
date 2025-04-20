const User = require('../models/user'); // Import the User model
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

 
exports.login = async (req, res) => {}

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