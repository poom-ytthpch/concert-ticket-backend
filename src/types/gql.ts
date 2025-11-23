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

export enum ReservationStatus {
    PENDING = "PENDING",
    RESERVED = "RESERVED",
    FAILED = "FAILED",
    SOLD_OUT = "SOLD_OUT",
    CANCELLED = "CANCELLED"
}

export class ActivityLogsInput {
    take?: Nullable<number>;
    skip?: Nullable<number>;
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

export class RegisterUserInput {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export class CreateConcertInput {
    name: string;
    description?: Nullable<string>;
    totalSeats: number;
    seatsAvailable: number;
}

export class GetConcertsInput {
    take?: Nullable<number>;
    skip?: Nullable<number>;
    isAdmin: boolean;
}

export class ReserveInput {
    userId: string;
    concertId: string;
}

export class CancelInput {
    userId: string;
    concertId: string;
}

export class CommonResponse {
    status: boolean;
    message: string;
}

export class ActivityLogGql {
    id?: Nullable<string>;
    user?: Nullable<UserGql>;
    userId?: Nullable<string>;
    concert?: Nullable<ConcertGql>;
    concertId?: Nullable<string>;
    createdAt?: Nullable<Date>;
}

export abstract class IQuery {
    abstract activityLogs(input: ActivityLogsInput): Nullable<Nullable<ActivityLogGql>[]> | Promise<Nullable<Nullable<ActivityLogGql>[]>>;

    abstract _(): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract getConcerts(input?: Nullable<GetConcertsInput>): GetConcertsResponse | Promise<GetConcertsResponse>;
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

export class RegisterUserResponse {
    status: boolean;
    message: string;
}

export abstract class IMutation {
    abstract registerUser(input: RegisterUserInput): RegisterUserResponse | Promise<RegisterUserResponse>;

    abstract register(input: RegisterInput): RegisterResponse | Promise<RegisterResponse>;

    abstract login(input: LoginInput): LoginResponse | Promise<LoginResponse>;

    abstract createConcert(input: CreateConcertInput): CreateConcertResponse | Promise<CreateConcertResponse>;

    abstract deleteConcert(id: string): boolean | Promise<boolean>;

    abstract reserve(input: ReserveInput): ReserveResponse | Promise<ReserveResponse>;

    abstract cancel(input: CancelInput): Cancelresponse | Promise<Cancelresponse>;
}

export class ConcertGql {
    id?: Nullable<string>;
    name?: Nullable<string>;
    description?: Nullable<string>;
    totalSeats?: Nullable<number>;
    seatsAvailable?: Nullable<number>;
    createdAt?: Nullable<Date>;
    reservations?: Nullable<Nullable<ReservationsGql>[]>;
    userReservationStatus?: Nullable<ReservationStatus>;
}

export class CreateConcertResponse {
    data?: Nullable<ConcertGql>;
    status?: Nullable<boolean>;
    message?: Nullable<string>;
}

export class ConcertSummary {
    totalSeat?: Nullable<number>;
    reserved?: Nullable<number>;
    cancelled?: Nullable<number>;
}

export class GetConcertsResponse {
    data?: Nullable<Nullable<ConcertGql>[]>;
    summary?: Nullable<ConcertSummary>;
}

export class ReservationsGql {
    id?: Nullable<string>;
    userId?: Nullable<string>;
    concertId?: Nullable<string>;
    status?: Nullable<ReservationStatus>;
    createdAt?: Nullable<Date>;
}

export class ReserveResponse {
    status: boolean;
    message: string;
}

export class Cancelresponse {
    status: boolean;
    message: string;
}

export class UserGql {
    id?: Nullable<string>;
    username?: Nullable<string>;
    email?: Nullable<string>;
}

type Nullable<T> = T | null;
