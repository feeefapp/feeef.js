import { InferInput } from "@vinejs/vine/types";
import { AxiosInstance } from "axios";
import { AuthToken, UserEntity } from "../../core/core";
import { SigninSchema, AuthUpdateUserSchema } from "../validators/auth";
import { CreateUserSchema, UpdateUserSchema } from "../validators/users";
import { ModelRepository } from "./repository";
/**
 * Represents the response returned by the authentication process.
 */
export interface AuthResponse {
    token: AuthToken;
    user: UserEntity;
}
/**
 * Represents a repository for managing user data.
 * Extends the ModelRepository class.
 */
export declare class UserRepository extends ModelRepository<UserEntity, InferInput<typeof CreateUserSchema>, InferInput<typeof UpdateUserSchema>> {
    /**
     * Represents the authentication response.
     */
    auth: AuthResponse | null;
    /**
     * Constructs a new UserRepository instance.
     * @param client - The AxiosInstance used for making HTTP requests.
     */
    constructor(client: AxiosInstance);
    /**
     * Signs in a user with the provided credentials.
     * @param credentials - The user credentials.
     * @returns A promise that resolves to the authentication response.
     */
    signin(credentials: InferInput<typeof SigninSchema>): Promise<AuthResponse>;
    /**
     * Signs up a new user with the provided credentials.
     * @param credentials - The user credentials.
     * @returns A promise that resolves to the authentication response.
     */
    signup(credentials: InferInput<typeof CreateUserSchema>): Promise<AuthResponse>;
    /**
     * Signs out the currently authenticated user.
     * @returns A promise that resolves when the user is signed out.
     */
    signout(): Promise<void>;
    /**
     * Updates the authenticated user's data.
     * @param data - The updated user data.
     * @returns A promise that resolves to the updated user entity.
     */
    updateMe(data: InferInput<typeof AuthUpdateUserSchema>): Promise<UserEntity>;
}
