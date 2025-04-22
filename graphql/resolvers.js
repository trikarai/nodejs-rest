// This file contains the resolvers for the GraphQL API.
// It defines the structure of the API and how to resolve queries and mutations.
const rootValue =  {
    hello: () => {
        return {
            text: "Hello World!",
            views: 1234,
        };
    },
}
module.exports = { rootValue };
