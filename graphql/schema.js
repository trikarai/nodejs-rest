const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }
    
    input UserInput {
        name: String!
        email: String!
        password: String!
    }

    input PostInput {
        title: String!
        content: String!
        imageUrl: String!
    }
    
    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    type AuthData {
        userId: ID!
        token: String!
    }

    type RootMutation {
        createUser(userInput : UserInput): User!
        createPost(postInput: PostInput): Post!
        updatePost(postId: ID!, postInput: PostInput): Post!
        deletePost(postId: ID!): Boolean!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int!): PostData!
        post(postId: ID!): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
  }
`);

module.exports = { schema };