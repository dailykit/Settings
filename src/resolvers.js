module.exports = {
    Query: {
        users: (_, __, { dataSources }) => dataSources.userAPI.getAllUsers(),
        user: (_, { id }, { dataSources }) =>
            dataSources.userAPI.getUser({ userId: id }),
        userRoles: (_, { id }, { dataSources }) =>
            dataSources.userAPI.getUserRoles({ userId: id }),
        clients: (_, __, { dataSources }) => dataSources.userAPI.getClients(),
        client: (_, { id }, { dataSources }) =>
            dataSources.userAPI.getClientDetails(id),
        clientRoles: (_, { id }, { dataSources }) =>
            dataSources.userAPI.getClientRoles({ id: id })
    },
    User: {
        userRoles(parent, args, { dataSources }, info) {
            return dataSources.userAPI.getUserRoles({ userId: parent.id });
        }
    },
    UserRole: {
        client(parent, args, { dataSources }, info) {
            return dataSources.userAPI.getClientDetails(parent.client.clientId);
        }
    },
    ClientRole: {
        permissions(parent, { id }, { dataSources }, info) {
            return dataSources.userAPI.getClientRoleAttributes({
                clientId: parent.clientId,
                roleName: parent.name
            });
        }
    },
    Mutation: {
        createNewUser: (_, { input }, { dataSources }) =>
            dataSources.userAPI.createNewUser({ userInput: input }),
        addNewUserRole: (_, { input }, { dataSources }) =>
            dataSources.userAPI.addNewUserRoles({ userRoleInput: input }),
        createNewClientRole: (_, { input }, { dataSources }) =>
            dataSources.userAPI.createNewClientRole({ clientRoleInput: input }),
        suspendUser: (_, { userId }, { dataSources }) =>
            dataSources.userAPI.suspendUser({ userId: userId }),
        createNewClient: (_, { input }, { dataSources }) =>
            dataSources.userAPI.createNewClient({ clientInput: input }),
        createNewClientRoleAttribute: (_, { input }, { dataSources }) =>
            dataSources.userAPI.createNewClientRoleAttribute({
                clientRoleAttributeInput: input
            })
    }
};
