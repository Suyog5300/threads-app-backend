import type { createUserPayload, getUserTokenPayload } from "../../services/user.js";
import UserService from "../../services/user.js";

const queries = {
    getUserToken: async(_: any, payload : getUserTokenPayload) => {
        const token = await UserService.getUserToken({
            email: payload.email,
            password: payload.password
        });
        return token;
    },

    getCurrentLoggedInUser: async(_: any, parameters : any, context : any) => {
        console.log("Context User:", context);
        if (!context.user) {
            throw new Error("Unauthorized");
        }
    }
};

const mutations = {
    createUser: async(_: any, payload : createUserPayload) => {
        const res = await UserService.createUser(payload);
        return `User created successfully: ${res}`;
    }
};

export const resolvers = { queries, mutations };