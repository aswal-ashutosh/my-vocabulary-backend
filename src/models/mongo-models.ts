import { ObjectId } from "mongodb";
import { HashedPassword } from "../types";

export interface OneTimePassword {
    _id: ObjectId;
    email: string;
    otp: number;
    createdAt: Date;
}

export interface User {
    _id: ObjectId;
    email: string;
    password: HashedPassword;
    createdAt: Date;
}

export interface Word {
    _id: ObjectId;
    term: string;
    definitions: string[];
    usages: string[];
    synonyms: string[];
    antonyms: string[];
    createdBy: string;
    createdAt: Date;
}
