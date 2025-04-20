const fs = require("fs"); // Import the file system module
const path = require("path"); // Import the path module

const clearImage = (filePath) => {
    const fullPath = path.join(__dirname, "..", filePath); // Resolve the full path of the file
    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error("Error deleting file:", err); // Log any errors that occur during file deletion
        }
    });
};

module.exports = { clearImage }; // Export the clearImage function

