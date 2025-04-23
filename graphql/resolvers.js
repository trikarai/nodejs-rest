const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const validator = require("validator"); // Import validator for input validation
const User = require('../models/user'); // Import the User model to interact with the database

// This file contains the resolvers for the GraphQL API.
// It defines the structure of the API and how to resolve queries and mutations.
const rootValue = {
  createUser: async (args, req) => {
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
};

// The rootValue object contains the resolvers for the GraphQL API
// Each key in the object corresponds to a field in the GraphQL schema
module.exports = { rootValue };
