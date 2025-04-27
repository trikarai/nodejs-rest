require("dotenv").config();
const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const expect = chai.expect;

const User = require("../models/user"); // Adjust the path as necessary
const authController = require("../controllers/authController"); // Adjust the path as necessary

const userId = "68084d8b349f9b58984a2776";  

describe("Auth Controller", () => {

    before(function (done) {
      // Hook to run before all tests
      mongoose
        .connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(() => {
          console.log("Connected to MongoDB");
          const user = new User({
            email: "test@test.com",
            password: "testpassword",
            name: "test name",
            posts: [],
            _id: userId, // Use the userId from the test
          }); // Create a new user instance
          return User.save(); // Save the user instance to the database
        })
        .then(() => {
          done(); // Call done to indicate the setup is complete
        });
    }); 

    beforeEach(function () {
        // Hook to run before each test
    });
    
    afterEach(function () {
        // Hook to run after each test
    });

    it("should throw an error if accessing the database fails", async () => {
        sinon.stub(User, "findOne").throws(); // Stub the User.findOne method to throw an error

        const req = { body: { email: "", password: "" } }; // Mock request object

        authController
        .login(req, {}, () => {})
        .then()
        .catch((err) => {
            expect(err).to.be.an("error"); // Check if the error is an instance of Error
            expect(err).to.have.property("statusCode", 500); // Check if the status code is 500
            done(); // Call done to indicate the test is complete
        });

        User.findOne.restore(); // Restore the original method
    });

    it("should send a response with a valid user status for an existing user", async () => {
        const req = { userId: userId }; // Mock request object with userId
        const res = {
            statusCode: 500, // Mock status code
            userStatus: null, // Mock user status
            status: function (code) {
                this.statusCode = code; // Set the status code
                return this; // Return the response object for chaining
            },
            json: function (data) {
                    this.userStatus = data.status; // Set the user status from the response data
            },
        };
        authController.getUserStatus(req, res, () => {})
            .then(() => { // Call the controller method
                expect(res.statusCode).to.equal(200); // Check if the status code is 200
                expect(res.userStatus).to.equal("I am new!"); // Check if the user status is correct
                done(); // Call done to indicate the test is complete
            });   
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
