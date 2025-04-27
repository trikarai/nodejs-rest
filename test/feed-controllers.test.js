require("dotenv").config();
const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const expect = chai.expect;

const User = require("../models/user"); // Adjust the path as necessary
const Post = require("../models/post"); // Adjust the path as necessary
const authMiddleware = require("../middleware/is-auth"); // Adjust the path as necessary

const postController = require("../controllers/feedController"); // Adjust the path as necessary
const authController = require("../controllers/authController"); // Adjust the path as necessary

const userId = "68084d8b349f9b58984a2776";  

describe("Feed Controller", () => {

    before(function (done) {
      // Hook to run before all tests
      mongoose
          .connect(process.env.MONGODB_URI)
          .then(() => {
            console.log("Connected to MongoDB");
            const user = new User({
              email: "test@test.com",
              password: "testpassword",
              name: "test name",
              posts: [],
              _id: userId, // Use the userId from the test
            }); // Create a new user instance
            return user.save(); // Save the user instance to the database
          })
          .then(() => {
            done(); // Call done to indicate the setup is complete
          }).catch(err => {
            console.error("Error connecting to MongoDB:", err); // Log any connection errors
            done(err); // Call done with the error to fail the test
          });
    }); 

    beforeEach(function () {
        // Hook to run before each test
    });
    
    afterEach(function () {
        // Hook to run after each test
    });

    it("should created post to the posts of the creator ", async () => {
        sinon.stub(User, "findOne").throws(); // Stub the User.findOne method to throw an error

        const req = { 
          body: { 
            title: "test post", 
            content: "this is contents from test"
          },
          file: { path: "test-path" }, // Mock file object with a path property
          userId: userId, // Mock userId
        }; // Mock request object

        authController
        .login(req, {}, () => {})
        .then(savedUser => {
            expect(savedUser).to.have.property("posts"); // Check if the saved user has a posts property
            expect(savedUser.posts).to.have.length(1); // Check if the length of posts is 1
            done(); // Call done to indicate the test is complete
        })    
    });

   after(function (done) {
    // Hook to run after all tests
    User.deleteMany({}) // Delete all users from the database
      .then(() => {
        return mongoose.disconnect(); // Disconnect from the database
      })
      .then(() => {
        done(); // Call done to indicate the teardown is complete
      });
    }); // End of after block
});
