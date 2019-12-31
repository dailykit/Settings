const { RESTDataSource } = require("apollo-datasource-rest");

class UserAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = "http://localhost:8281/auth/";
    }

    willSendRequest(request) {
        console.log("token in userjs: " + this.context.token);
        request.headers.set("Authorization", "Bearer " + this.context.token);
    }

    // Resolver method #1. Get all users
    async getAllUsers() {
        const response = await this.get(
            "admin/realms/" + this.context.realmname + "/users"
        );
        return Array.isArray(response)
            ? response.map(user => this.userReducer(user))
            : [];
    }

    // Resolver method #2. Get specific user details
    async getUser({ userId }) {
        const response = await this.get(
            "admin/realms/" + this.context.realmname + "/users/" + userId
        );
        return this.userReducer(response);
    }

    // Resolver method #3.Get only specific user roles
    async getUserRoles({ userId }) {
        const response = await this.get(
            "admin/realms/" +
                this.context.realmname +
                "/users/" +
                userId +
                "/role-mappings"
        );
        const clientMappings = Object.keys(response.clientMappings);
        let rolesObject = [];
        clientMappings.forEach(element => {
            let currentObject = response.clientMappings[element];
            if (element != "account") {
                rolesObject.push(this.buildRoleObject(currentObject));
            }
        });

        return rolesObject.map(userRoles => this.rolesReducer(userRoles));
    }

    // Resolver method #4. Get all clients
    async getClients() {
        const response = await this.get(
            "admin/realms/" + this.context.realmname + "/clients"
        );
        return response.map(client => this.clientReducer(client));
    }

    // Resolver method #5. Get specific client details by clientId
    async getClientDetails({ clientId }) {
        const response = await this.get(
            "admin/realms/" +
                this.context.realmname +
                "/clients?clientId=" +
                clientId
        );
        return this.clientReducer(response[0]);
    }

    // Resolver method #6. Get all roles of a specific client by its Id
    async getClientRoles({ id }) {
        const response = await this.get(
            "admin/realms/" +
                this.context.realmname +
                "/clients/" +
                id +
                "/roles"
        );
        return response.map(clientRoles => this.clientRoleReducer(clientRoles));
    }

    // Helper functions
    // Reducer functions for user(s)
    userReducer(user) {
        return {
            id: user.id,
            username: user.username,
            enabled: user.enabled,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email
            // userRoles will be resolved by its own resolver using nesting concept
        };
    }

    // Reducer function for client(s)
    clientReducer(client) {
        return {
            id: client.id,
            clientId: client.clientId,
            name: client.name
        };
    }

    // Reducer function for userRoles
    rolesReducer(roles) {
        return {
            client: roles.client,
            roles: roles.roles,
            clientId: "someid"
        };
    }

    // Reducer for client roles
    clientRoleReducer(clientRole) {
        return {
            id: clientRole.id,
            name: clientRole.name,
            description: clientRole.description
        };
    }

    // Helper function to build nested userRole object
    buildRoleObject(currentObject) {
        let x = new Object();
        x.client = new Object({ clientId: currentObject.client });

        x.roles = currentObject.mappings.map(clientRoles =>
            this.clientRoleReducer(clientRoles)
        );
        return x;
    }

    // Method to create new user using mutation
    async createNewUser({ userInput }) {
        var userToCreate = {
            firstName: userInput.firstname,
            lastName: userInput.lastname,
            email: userInput.email,
            enabled: true,
            username: userInput.email,
            notBefore: 0
        };

        const response = await this.post(
            "admin/realms/" + this.context.realmname + "/users",
            userToCreate
        );

        return "success";
    }

    // Method to add client role to a user
    async addNewUserRole({ userRoleInput }) {
        var userRoleToAdd = [
            {
                id: userRoleInput.roleId,
                name: userRoleInput.roleName
            }
        ];

        const response = await this.post(
            "admin/realms/" +
                this.context.realmname +
                "/users/" +
                userRoleInput.userId +
                "/role-mappings/clients/" +
                userRoleInput.clientId,
            userRoleToAdd
        );

        return "success";
    }
}

module.exports = UserAPI;
