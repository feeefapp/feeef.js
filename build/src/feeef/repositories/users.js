import vine from "@vinejs/vine";
import { SigninSchema, AuthUpdateUserSchema } from "../validators/auth";
import { CreateUserSchema } from "../validators/users";
import { ModelRepository } from "./repository";
/**
 * Represents a repository for managing user data.
 * Extends the ModelRepository class.
 */
export class UserRepository extends ModelRepository {
    /**
     * Represents the authentication response.
     */
    auth = null;
    /**
     * Constructs a new UserRepository instance.
     * @param client - The AxiosInstance used for making HTTP requests.
     */
    constructor(client) {
        super("users", client);
    }
    /**
     * Signs in a user with the provided credentials.
     * @param credentials - The user credentials.
     * @returns A promise that resolves to the authentication response.
     */
    async signin(credentials) {
        // validate the input
        const validator = vine.compile(SigninSchema);
        const output = await validator.validate(credentials);
        const res = await this.client.post(`/${this.resource}/auth/signin`, output);
        this.auth = res.data;
        return res.data;
    }
    /**
     * Signs up a new user with the provided credentials.
     * @param credentials - The user credentials.
     * @returns A promise that resolves to the authentication response.
     */
    async signup(credentials) {
        // validate the input
        const validator = vine.compile(CreateUserSchema);
        const output = await validator.validate(credentials);
        const res = await this.client.post(`/${this.resource}/auth/signup`, output);
        this.auth = res.data;
        return res.data;
    }
    /**
     * Signs out the currently authenticated user.
     * @returns A promise that resolves when the user is signed out.
     */
    async signout() {
        this.auth = null;
    }
    /**
     * Updates the authenticated user's data.
     * @param data - The updated user data.
     * @returns A promise that resolves to the updated user entity.
     */
    async updateMe(data) {
        const validator = vine.compile(AuthUpdateUserSchema);
        const output = await validator.validate(data);
        const res = await this.client.put(`/${this.resource}/auth`, output);
        return res.data;
    }
}
