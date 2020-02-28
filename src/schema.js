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
        firstName: String!
        lastName: String!
        email: String!
        userRoles: [UserRole]
        attributes: UserAttributes
    }

    type UserRole {
        client: Client
        roles: [ClientRole]
    }

    type UserAttributes {
        mobile: [String]
        profileImage: [String]
    }

    type Client {
        id: String!
        clientId: String!
        name: String
        enabled: Boolean!
        baseUrl: String
        adminUrl: String
        rootUrl: String
    }

    type ClientRole {
        id: String!
        name: String!
        description: String
        permissions: [ClientRoleAttribute]
    }

    type ClientRoleAttribute {
        name: String!
        value: String
    }

    type Mutation {
        createNewUser(input: UserInput): String!
        addNewUserRole(input: UserRoleInput): String!
        createNewClientRole(input: ClientRoleInput): String!
        suspendUser(userId: String): String!
        createNewClient(input: ClientInput): String!
        createNewClientRoleAttribute(input: clientRoleAttributeInput): String!
    }

    input UserInput {
        firstName: String!
        lastName: String!
        email: String!
        mobile: String
        profileImage: String
    }

    input UserRoleInput {
        userId: String!
        clientId: String!
        roleId: [String]!
        roleName: [String]!
    }

    input ClientRoleInput {
        clientId: String!
        name: String!
        description: String!
    }

    input ClientInput {
        clientId: String!
        name: String!
        description: String
        rootUrl: String
        baseUrl: String
        adminUrl: String
        redirectUris: [String]
        webOrigins: [String]
        bearerOnly: Boolean
        standardFlowEnabled: Boolean
        directAccessGrantsEnabled: Boolean
        serviceAccountsEnabled: Boolean
        publicClient: Boolean
    }

    input clientRoleAttributeInput {
        clientId: ID!
        roleName: String!
        roleDescription: String
        attributeNames: [String]!
        attributeValues: [String]!
    }
`;

module.exports = typeDefs;
