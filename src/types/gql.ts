
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum RoleType {
    ADMIN = "ADMIN",
    USER = "USER"
}

export class RegisterInput {
    username: string;
    email: string;
    password: string;
    roles: RoleType[];
}

export class CommonResponse {
    status: boolean;
    message: string;
}

export class RegisterResponse {
    status: boolean;
    message: string;
}

export abstract class IQuery {
    abstract _(): Nullable<boolean> | Promise<Nullable<boolean>>;
}

export abstract class IMutation {
    abstract register(input: RegisterInput): RegisterResponse | Promise<RegisterResponse>;
}

type Nullable<T> = T | null;
