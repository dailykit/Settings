const { RESTDataSource } = require("apollo-datasource-rest");

class UserAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = "http://localhost:8281/auth/";
    }

    willSendRequest(request) {
        request.headers.set("Authorization", "Bearer " + this.context.token);
        request.headers.set("Content-Type", "application/json");
    }

    // Resolver method #1. Get all users
    async getAllUsers() {
        const response = await this.get(
            "admin/realms/" + this.context.realmname + "/users"
        );
        return response;
    }

    // Resolver method #2. Get specific user details
    async getUser({ userId }) {
        const response = await this.get(
            "admin/realms/" + this.context.realmname + "/users/" + userId
        );
        return response;
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

        return rolesObject;
    }

    // Resolver method #4. Get all clients
    async getClients() {
        const response = await this.get(
            "admin/realms/" + this.context.realmname + "/clients"
        );
        return response;
    }

    // Resolver method #5. Get specific client details by clientId
    async getClientDetails({ clientId }) {
        const response = await this.get(
            "admin/realms/" +
                this.context.realmname +
                "/clients?clientId=" +
                clientId
        );
        return response[0];
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
        return response;
    }

    // Helper functions
    // Helper function to build nested userRole object
    buildRoleObject(currentObject) {
        let x = new Object();
        x.client = new Object({ clientId: currentObject.client });
        x.roles = currentObject.mappings;
        return x;
    }

    // Mutations
    // Mutation Method #1. Create new user
    async createNewUser({ userInput }) {
        var userToCreate = {
            firstName: userInput.firstname,
            lastName: userInput.lastname,
            email: userInput.email,
            enabled: true,
            username: userInput.email,
            notBefore: 0,
            credentials: [
                {
                    type: "password",
                    value: "Welcome1"
                }
            ],
            requiredActions: ["UPDATE_PASSWORD", "VERIFY_EMAIL"],
            attributes: {
                mobile: [userInput.mobile],
                profileImage: [userInput.profileImage]
            }
        };

        const response = await this.post(
            "admin/realms/" + this.context.realmname + "/users",
            JSON.stringify(userToCreate)
        );

        return "success";
    }

    // Mutation Method #2. Add client role to a user
    async addNewUserRoles({ userRoleInput }) {
        var userRolesToAdd = [];
        for (let index = 0; index < userRoleInput.roleName.length; index++) {
            var x = {};
            x.id = userRoleInput.roleId[index];
            x.name = userRoleInput.roleName[index];
            userRolesToAdd.push(x);
        }

        const response = await this.post(
            "admin/realms/" +
                this.context.realmname +
                "/users/" +
                userRoleInput.userId +
                "/role-mappings/clients/" +
                userRoleInput.clientId,
            JSON.stringify(userRolesToAdd)
        );

        return "success";
    }

    // Mutation Method #3. Create new client role
    async createNewClientRole({ clientRoleInput }) {
        var roleToCreate = {
            name: clientRoleInput.name,
            description: clientRoleInput.description
        };

        const response = await this.post(
            "admin/realms/" +
                this.context.realmname +
                "/clients/" +
                clientRoleInput.clientId +
                "/roles",
            JSON.stringify(roleToCreate)
        );
        return "success";
    }

    // Mutation Method #4. Suspend User
    async suspendUser({ userId }) {
        const response = await this.put(
            "admin/realms/" + this.context.realmname + "/users/" + userId,
            JSON.stringify({ enabled: false })
        );
        return "success";
    }
}

module.exports = UserAPI;
