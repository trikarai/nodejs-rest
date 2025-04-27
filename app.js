require("dotenv").config();
const path = require("path");
const fs = require("fs"); // Import file system module for file operations

const express = require("express");
const mongoose = require("mongoose"); // Import mongoose for MongoDB connection
const multer = require("multer"); // Import multer for file uploads
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs

const { schema } = require("./graphql/schema"); // Import GraphQL schema
const { rootValue } = require("./graphql/resolvers"); // Import GraphQL resolvers
const { createHandler } = require('graphql-http/lib/use/express');

const auth = require("./middleware/is-auth"); // Import authentication middleware

const { clearImage } = require("./utils/image"); // Import utility function for clearing images

 
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname); // Set the filename for uploaded files
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // Accept the file if it is a PNG, JPG, or JPEG image
  } else {
    cb(null, false); // Reject the file if it is not an accepted type
  }
};

const fileUpload = multer({ storage: fileStorage, fileFilter: fileFilter }); // Initialize multer with the storage configuration

app.use(express.json()); // Middleware to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(fileUpload.single("file")); // Middleware to handle single file uploads with the field name 'file'
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve static files from the 'images' directory

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Respond with 200 OK for preflight requests
  }
  next(); // Call the next middleware function
});

app.put("/post-image", (req, res, next) => {
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" }); // Respond with 200 OK if no file is provided
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath); // Clear the old image if a new one is provided
  }
  return res.status(201).json({ message: "File stored.", fileUrl: req.file.path.replace("\\", "/") }); // Respond with 201 Created and the file URL
});

app.use(auth); // Use the authentication middleware

app.use(
  "/graphql",
  (req, res, next) =>
    createHandler({
      schema: schema,
      rootValue: rootValue,
      formatError: (err) => {
        if (err.originalError) {
          const data = err.originalError.data; // Get any additional data from the original error
          const message = err.message || "An error occurred."; // Get the error message
          const code = err.originalError.code || 500; // Get the error code or default to 500
          return { message: message, status: code, data: data }; // Return the error response
        }
        return err; // Return the original error if no specific error is found
      },
      context: { req, res }, // Pass the request and response objects to the context
    })(req, res, next) // Use the GraphQL handler for incoming requests
  // Pass the request, response, and next function to the handler
);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500; // Get the status code from the error or default to 500
  const message = error.message; // Get the error message
  const data = error.data; // Get any additional data from the error
  res.status(status).json({ message: message, data: data }); // Send the error response as JSON
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      app.listen(8080, () => {
        console.log("Server is running on port 8080");
      });
      console.log("Connected to MongoDB");
    })
    .catch((err) => console.log(err));