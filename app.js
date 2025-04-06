const express = require('express');

const app = express(); 

// Import the routes
const feedRoutes = require('./routes/feed'); 

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use('/feed', feedRoutes); // Use the feed routes for any requests to /feed

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
