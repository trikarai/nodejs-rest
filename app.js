require("dotenv").config();
const http = require("http");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose"); // Import mongoose for MongoDB connection
const multer = require("multer"); // Import multer for file uploads
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs

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

// Import the routes
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

app.use(express.json()); // Middleware to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(fileUpload.single("file")); // Middleware to handle single file uploads with the field name 'file'
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve static files from the 'images' directory

app.use("/feed", feedRoutes); // Use the feed routes for any requests to /feed
app.use("/auth", authRoutes); // Use the feed routes for any requests to /feed

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

const server = http.createServer(app);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      server.listen(8080, () => {
        console.log("Server is running on port 8080");
      });
      console.log("Connected to MongoDB");

      const io = require("./socket").init(server); // Initialize socket.io with the server
      
      io.on("connection", (socket) => {
        console.log("Client connected:", socket.id); // Log when a client connects
        socket.on("disconnect", () => {
          console.log("Client disconnected");
        });
      });
    })
    .catch((err) => console.log(err));

 