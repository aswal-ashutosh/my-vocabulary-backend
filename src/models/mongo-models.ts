import { ObjectId } from "mongodb";
import { HashedPassword } from "../types";

export interface OneTimePassword {
    _id: ObjectId;
    email: string;
    otp: number;
    createdAt: Date;
}

export interface User {
    _id_: ObjectId;
    email: string;
    password: HashedPassword;
    createdAt: Date;
}
