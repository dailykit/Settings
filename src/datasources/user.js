const { RESTDataSource } = require("apollo-datasource-rest");

class UserAPI extends RESTDataSource {
    constructor(baseUrl) {
        super();
        this.baseURL = baseUrl;
        this.clientsToAvoid = [
            "account",
            "realm-management",
            "security-admin-console",
            "admin-cli",
            "broker"
        ];
    }

    // Set request headers like Authorization, content-type
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
            if (!this.clientsToAvoid.includes(element)) {
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
        let filteredResponse = response;
        this.clientsToAvoid.forEach(element => {
            filteredResponse = filteredResponse.filter(
                item => item.clientId !== element
            );
        });
        return filteredResponse;
    }

    // Resolver method #5. Get specific client details by clientId
    async getClientDetails(clientId) {
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
        return response.map(clientRole =>
            this.clientRoleReducer(clientRole, id)
        );
    }

    // Resolver Method #7. Get client role attributes(permissions)
    async getClientRoleAttributes({ clientId, roleName }) {
        const response = await this.get(
            "admin/realms/" +
                this.context.realmname +
                "/clients/" +
                clientId +
                "/roles/" +
                roleName
        );
        let attributes = [];
        const attributesKeys = Object.keys(response.attributes);
        attributesKeys.forEach(element => {
            let x = {};
            x["name"] = element;
            x["value"] = response.attributes[element][0];
            attributes.push(x);
        });
        return attributes;
    }

    // Helper functions
    // Helper function to build nested userRole object
    buildRoleObject(currentObject) {
        let x = new Object();
        x.client = new Object({ clientId: currentObject.client });
        x.roles = currentObject.mappings.map(clientRole =>
            this.clientRoleReducer(clientRole, currentObject.id)
        );
        return x;
    }

    // Client role reducer
    clientRoleReducer(clientRole, id) {
        return {
            id: clientRole.id,
            name: clientRole.name,
            description: clientRole.description,
            clientId: id
        };
    }

    // Mutations
    // Mutation Method #1. Create new user
    async createNewUser({ userInput }) {
        var userToCreate = {
            firstName: userInput.firstName,
            lastName: userInput.lastName,
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

    // Mutation Method #5. Create new client/app
    async createNewClient({ clientInput }) {
        var clientToCreate = {
            clientId: clientInput.clientId,
            name: clientInput.name,
            description: clientInput.description,
            protocol: "openid-connect",
            rootUrl: clientInput.rootUrl,
            baseUrl: clientInput.baseUrl,
            redirectUris: clientInput.redirectUris,
            webOrigins: clientInput.webOrigins,
            bearerOnly: clientInput.bearerOnly,
            publicClient: clientInput.publicClient,
            standardFlowEnabled: clientInput.standardFlowEnabled,
            directAccessGrantsEnabled: clientInput.directAccessGrantsEnabled
        };

        const response = await this.post(
            "admin/realms/" + this.context.realmname + "/clients",
            JSON.stringify(clientToCreate)
        );

        // Get the newly created client details
        const resp = await this.get(
            "admin/realms/" +
                this.context.realmname +
                "/clients?clientId=" +
                clientInput.clientId
        );
        var newClient = resp[0];
        var newClientId = newClient.id;

        var scriptMapperToAdd = {
            name: "PermissionsMapper",
            protocol: "openid-connect",
            protocolMapper: "oidc-script-based-protocol-mapper",
            consentRequired: false,
            config: {
                "id.token.claim": false,
                "access.token.claim": true,
                "claim.name": clientInput.clientId + "RolePermissions",
                "userinfo.token.claim": true,
                script:
                    'var ArrayList = Java.type("java.util.ArrayList");\nvar roles = new ArrayList();\nvar client = keycloakSession.getContext().getClient()\nuser.getClientRoleMappings(client).forEach(function(roleModel){\n   var role = {};\n   var rn = roleModel.getName();\n   role["role"] = rn;\n   var rolePerms = {};\n   var map = roleModel.getAttributes();\n   map.forEach(function(key, value){\n      rolePerms[key] = value[0];\n   });\n   role["permissions"] = rolePerms;\n   roles.add(role);\n});\nexports = {"rolePermissions" : roles};'
            }
        };

        // Add a script protocol mapper to the client
        const res = await this.post(
            "admin/realms/" +
                this.context.realmname +
                "/clients/" +
                newClientId +
                "/protocol-mappers/models",
            scriptMapperToAdd
        );

        return "success";
    }

    // Mutation Method #6. Create new client role attribute
    async createNewClientRoleAttribute({ clientRoleAttributeInput }) {
        var attrs = {};
        for (
            let index = 0;
            index < clientRoleAttributeInput.attributeNames.length;
            index++
        ) {
            let val = [];
            val.push(clientRoleAttributeInput.attributeValues[index]);
            attrs[clientRoleAttributeInput.attributeNames[index]] = val;
        }
        var attributesToAdd = {
            name: clientRoleAttributeInput.roleName,
            description: clientRoleAttributeInput.roleDescription,
            attributes: attrs
        };
        const response = await this.put(
            "admin/realms/" +
                this.context.realmname +
                "/clients/" +
                clientRoleAttributeInput.clientId +
                "/roles/" +
                clientRoleAttributeInput.roleName,
            JSON.stringify(attributesToAdd)
        );
        return "success";
    }
}

module.exports = UserAPI;
