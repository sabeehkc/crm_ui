import { IUser } from "./user";

export interface registerRequest {
    name: string;
    email: string;
    password: string;
}

export interface registerResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            _id: string;
            name: string;
            email: string;
        };
        accessToken: string;
        refreshToken: string;
    };
}


export interface loginRequest {
    email: string;
    password: string;
}

export interface loginResponse {
    success: boolean;
    message: string;
    data: {
        user: IUser;
        accessToken: string;
        refreshToken: string;
    };
}