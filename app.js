require("dotenv").config();
const http = require("http");

const express = require("express");
const mongoose = require("mongoose"); // Import mongoose for MongoDB connection
const app = express();

// Import the routes
const feedRoutes = require("./routes/feed");

app.use(express.json()); // Middleware to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.use("/feed", feedRoutes); // Use the feed routes for any requests to /feed

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
  next(); // Call the next middleware function
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

 