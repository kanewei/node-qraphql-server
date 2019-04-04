const{ buildSchema } = require('graphql');

module.exports = buildSchema(`

    type Post {
        _id: ID!
        title: String!
        content: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        email: String!
        password: String
        name: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        password: String!
        name: String!
    }

    input PostInputData {
        title: String!
        content: String!
    }

    type RootQuery {
        login(email: String!, password: String): AuthData!
        getPosts(): PostData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): Boolean
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)