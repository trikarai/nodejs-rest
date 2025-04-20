require("dotenv").config();
const jwt = require("jsonwebtoken"); // Import JWT library

module.exports = (req, res, next) => {
  // Middleware function to check authentication
  const authHeader = req.get("Authorization"); // Get the Authorization header from the request
  if (!authHeader) {
    // If no Authorization header is present
    const error = new Error("Not authenticated."); // Create a new error
    error.statusCode = 401; // Set status code to 401 (Unauthorized)
    throw error; // Throw the error to be handled by the error handling middleware
  }
  const token = authHeader.split(" ")[1]; // Split the Authorization header to get the token
  let decodedToken; // Variable to hold the decoded token
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify and decode the token using the secret key
  } catch (err) {
    // Catch any errors during token verification
    err.statusCode = 500; // Set status code to 500 (Internal Server Error)
    throw err; // Throw the error to be handled by the error handling middleware
  }
  if (!decodedToken) {
    // If token is not valid or expired
    const error = new Error("Not authenticated."); // Create a new error
    error.statusCode = 401; // Set status code to 401 (Unauthorized)
    throw error; // Throw the error to be handled by the error handling middleware
  }
  req.userId = decodedToken.userId; // Attach user ID from decoded token to request object
  next(); // Call next middleware in the stack
};
