const express = require('express');
const { validationResult, body } = require("express-validator");

const User = require('../models/user'); // Import the User model

const router = express.Router(); // Create a new router instance

const authController = require('../controllers/authController'); // Import the auth controller

router.put(
  "/signup",
  [
    body("name").trim().isLength({ min: 5 }), // Validate name field
    body("email")
      .isEmail() // Validate email field
      .withMessage("Please enter a valid email address.")
      .custom( async (value, { req }) => {
        return User.findOne({ email: value }) // Check if email already exists in the database
          .then((userDoc) => {
            if (userDoc) {
              return Promise.reject("E-Mail address already exists!"); // Reject if email already exists
            }
          });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 6 }), // Validate password field
  ],
  authController.signup
); // Handle signup request

router.post(
  "/login",
  [
    body("email")
      .isEmail() // Validate email field
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password").trim().isLength({ min: 6 }), // Validate password field
  ],
  authController.login
); // Handle login request

module.exports = router; // Export the router instance