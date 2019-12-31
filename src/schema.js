const { gql } = require("apollo-server");

const typeDefs = gql`
    type Query {
        users: [User]!
        user(id: ID!): User
        userRoles(id: ID!): [UserRole]
        clients: [Client]!
        client(id: ID!): Client!
        clientRoles(id: ID!): [ClientRole]
    }

    type User {
        id: ID!
        username: String!
        enabled: Boolean!
        firstname: String!
        lastname: String!
        email: String!
        userRoles: [UserRole]
    }

    type UserRole {
        client: Client
        roles: [ClientRole]
    }

    type Client {
        id: String!
        clientId: String!
        name: String
        enabled: Boolean!
    }

    type ClientRole {
        id: String!
        name: String!
        description: String
    }

    type Mutation {
        createNewUser(input: UserInput): String!
        addNewUserRole(input: UserRoleInput): String!
    }

    input UserInput {
        firstname: String!
        lastname: String!
        email: String!
    }

    input UserRoleInput {
        userId: String!
        clientId: String!
        roleId: String!
        roleName: String!
    }
`;

module.exports = typeDefs;
