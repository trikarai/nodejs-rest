require("dotenv").config();
const jwt = require("jsonwebtoken"); // Import JWT library

module.exports = (req, res, next) => {
  // Middleware function to check authentication
  const authHeader = req.get("Authorization"); // Get the Authorization header from the request
  if (!authHeader) {
    req.isAuth = false;
    return next(); // If no token, proceed to the next middleware
  }
  const token = authHeader.split(" ")[1]; // Split the Authorization header to get the token
  let decodedToken; // Variable to hold the decoded token
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify and decode the token using the secret key
  } catch (err) {
    req.isAuth = false;
    return next(); // If no token, proceed to the next middleware
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next(); // If no token, proceed to the next middleware
  }
  req.userId = decodedToken.userId; // Attach user ID from decoded token to request object
  req.isAuth = true;
  next(); // Call next middleware in the stack
};
