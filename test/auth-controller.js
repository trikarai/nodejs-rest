const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

const User = require('../models/user'); // Adjust the path as necessary
const authController = require('../controllers/authController'); // Adjust the path as necessary

describe('Auth Controller', () => {
  
  
    it('should throw an error if accessing the database fails', async () => {
        sinon.stub(User, 'findOne').throws(); // Stub the User.findOne method to throw an error

        const req = { body: { email: '', password: '' } }; // Mock request object

        authController.login(req, {}, () => {})
            .then()
            .catch(err => {
                expect(err).to.be.an('error'); // Check if the error is an instance of Error
                expect(err).to.have.property('statusCode', 500); // Check if the status code is 500
                // done(); // Call done to indicate the test is complete
            });
 
        User.findOne.restore(); // Restore the original method
    });    

});  