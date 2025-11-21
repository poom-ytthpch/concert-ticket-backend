
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

export class LoginInput {
    email: string;
    password: string;
}

export class CreateConcertInput {
    name: string;
    description?: Nullable<string>;
    totalSeats: number;
    seatsAvailable: number;
    createdAt?: Nullable<Date>;
}

export class ReserveInput {
    userId: string;
    concertId: string;
}

export class CommonResponse {
    status: boolean;
    message: string;
}

export class RegisterResponse {
    status: boolean;
    message: string;
}

export class LoginResponse {
    status: boolean;
    message: string;
    token?: Nullable<string>;
}

export abstract class IQuery {
    abstract _(): Nullable<boolean> | Promise<Nullable<boolean>>;
}

export abstract class IMutation {
    abstract register(input: RegisterInput): RegisterResponse | Promise<RegisterResponse>;

    abstract login(input: LoginInput): LoginResponse | Promise<LoginResponse>;

    abstract createConcert(input: CreateConcertInput): CreateConcertResponse | Promise<CreateConcertResponse>;

    abstract deleteConcert(id: string): boolean | Promise<boolean>;

    abstract reserve(input?: Nullable<ReserveInput>): Nullable<boolean> | Promise<Nullable<boolean>>;
}

export class Concert {
    id: string;
    name?: Nullable<string>;
    description?: Nullable<string>;
    totalSeats?: Nullable<number>;
    seatsAvailable?: Nullable<number>;
    createdAt?: Nullable<Date>;
}

export class CreateConcertResponse {
    data?: Nullable<Concert>;
    status?: Nullable<boolean>;
    message?: Nullable<string>;
}

export class ReserveResponse {
    status: boolean;
    message: string;
}

type Nullable<T> = T | null;
