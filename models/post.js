const mongoose = require("mongoose");
const { Schema } = mongoose; // Import Schema from mongoose

const postSchema = new Schema({
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    }, 
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

module.exports =  mongoose.model("Post", postSchema); // Create a model from the schema and export it
