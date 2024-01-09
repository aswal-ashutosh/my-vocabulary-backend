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
    word: string;
    definitions: string[];
    sentences: string[];
    similarWords: string[];
    oppositeWords: string[];
    createdBy: string;
    createdAt: Date;
}
