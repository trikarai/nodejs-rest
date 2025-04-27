require("dotenv").config();
const chai = require("chai");
const sinon = require("sinon");
const moongose = require("mongoose");
const expect = chai.expect;

const User = require("../models/user"); // Adjust the path as necessary
const authController = require("../controllers/authController"); // Adjust the path as necessary

describe("Auth Controller", () => {
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
    const  userId = "68084d8b349f9b58984a2776";  

    moongose.connect(process.env.MONGODB_URI)
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
            authController.getUserStatus(req, res, () => {}).then(() => { // Call the controller method
              expect(res.statusCode).to.equal(200); // Check if the status code is 200
              expect(res.userStatus).to.equal("I am new!"); // Check if the user status is correct

              User.deleteMany({}) // Clean up the database by deleting all users
                .then(() => {
                  console.log("Test user deleted from database"); // Log the deletion
                })
                .catch((err) => {
                  console.error(err); // Log any errors during deletion
                });
                
              // Disconnect from the database after the test is complete
              moongose.disconnect(() => {
                done(); // Call done to indicate the test is complete
              }); // Disconnect from the database
            });
        })
        .catch((err) => {
            console.error(err); // Log any errors
        })
   });
});
