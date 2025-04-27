const expect = require('chai').expect;

it('shuld add two numbers', function () {
  const a = 5;
  const b = 10;
  const sum = a + b;
  expect(sum).to.equal(15);
});

it('should subtract two numbers', function () {
  const a = 10;
  const b = 5;
  const difference = a - b;
  expect(difference).to.equal(5);
});