const chai = require('chai');
const jwt = require("jsonwebtoken"); // Import JWT library

const authMiddleware = require('../middleware/is-auth'); // Adjust the path as necessary

const expect = chai.expect;

describe('Auth Middleware', () => { // Start of describe block
  it('should set req.isAuth to false if no Authorization header is present', () => {
    const req = { get: () => null }; // Mock request object
    const res = {}; // Mock response object
    const next = () => {}; // Mock next function

    authMiddleware(req, res, next); // Call the middleware

    expect(req.isAuth).to.be.false; // Check if isAuth is set to false
  });

  it("should set req.isAuth to true if a valid Authorization header is present", () => {
    // Generate a valid token
    const validToken = jwt.sign(
      { userId: "12345" }, // Payload with userId
      process.env.JWT_SECRET_KEY, // Secret key from environment variables
      { expiresIn: "1h" } // Token expiration time
    );

    // Mock request object with Authorization header
    const req = {
      get: (headerName) => {
        if (headerName === "Authorization") {
          return `Bearer ${validToken}`; // Return the valid token in the Authorization header
        }
        return null;
      },
    };
    const res = {}; // Mock response object
    const next = () => {}; // Mock next function

    authMiddleware(req, res, next); // Call the middleware

    // Assert that req.isAuth is set to true and userId is correctly extracted
    expect(req.isAuth).to.be.true;
    expect(req.userId).to.equal("12345");
  });
}); // End of describe block