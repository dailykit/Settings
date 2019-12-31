const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
require("dotenv").config();

const UserAPI = require("./datasources/user");
const access_token = process.env.ACCESS_TOKEN;
const realmname = process.env.REALM_NAME;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        userAPI: new UserAPI()
    }),
    context: () => {
        return {
            token: access_token,
            realmname: realmname
        };
    }
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
