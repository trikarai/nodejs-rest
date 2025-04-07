require("dotenv").config();
const http = require("http");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose"); // Import mongoose for MongoDB connection
const app = express();

// Import the routes
const feedRoutes = require("./routes/feed");

app.use(express.json()); // Middleware to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve static files from the images directory

app.use("/feed", feedRoutes); // Use the feed routes for any requests to /feed

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
  next(); // Call the next middleware function
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500; // Get the status code from the error or default to 500
  const message = error.message; // Get the error message
  const data = error.data; // Get any additional data from the error
  res.status(status).json({ message: message, data: data }); // Send the error response as JSON
});

mongoose
  .connect(process.env.MONGODB_URI, {
    // Replace with your MongoDB connection string
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const server = http.createServer(app);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        server.listen(8080, () => {
          console.log("Server is running on port 8080");
        });
        console.log("Connected to MongoDB");
    })
    .catch((err) => console.log(err));

 