const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
require("dotenv").config();

const UserAPI = require("./datasources/user");
const realmname = process.env.REALM_NAME;
const keycloakUrl = process.env.KEYCLOAK_SERVER;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        userAPI: new UserAPI(keycloakUrl)
    }),
    context: ({ req }) => {
        const token = req.headers.authorization;
        return {
            token: token,
            realmname: realmname
        };
    }
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
