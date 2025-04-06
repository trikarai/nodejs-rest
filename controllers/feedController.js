exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                id: 'p1',
                title: 'First Post',
                content: 'This is the first post!',
            },
            {
                id: 'p2',
                title: 'Second Post',
                content: 'This is the second post!',
            },
        ],
    });
}

exports.createPost = (req, res, next) => {
    const title = req.body.title; // Extract title from request body
    const content = req.body.content; // Extract content from request body

    // Here you would typically save the post to a database
    // For now, we'll just return the created post as a response
    res.status(201).json({
        message: 'Post created successfully!',
        post: {
            id: new Date().toISOString(), // Simulate an ID for the new post
            title: title,
            content: content,
        },
    });
}