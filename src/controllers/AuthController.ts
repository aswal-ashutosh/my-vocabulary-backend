import { Request, Response } from "express";
import Controller from "./Controller";
import Joi from "joi";
import { APIResponse, AuthorizationToken, HashedPassword } from "../types";
import HttpStatusCode from "../constants/http-status-codes";
import MongoDBService from "../services/MongoDBService";
import collections from "../constants/mongodb-collections";
import NodeMailerService from "../services/NodemailerService";
import HttpError from "../customs/HttpError";
import { OneTimePassword, User } from "../models/mongo-models";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../constants/config";

export default class AuthController extends Controller {
    constructor(req: Request, res: Response) {
        super(req, res);
    }

    public async signUp() {
        try {
            const bodySchema = Joi.object({
                email: Joi.string().trim().email().required(),
            });
            const {
                body: { email },
            } = await this.validateRequest({ bodySchema });
            const { status, body } = await AuthController.signUp(email);
            this.sendResponse(status, body);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private static async signUp(email: string): Promise<APIResponse> {
        const db = await MongoDBService.getDB();
        const userDoc = await db.collection(collections.USERS).findOne({ email });
        if (userDoc) {
            throw new HttpError({ status: HttpStatusCode.CONFLICT, message: "Email already in use." });
        }
        const otp = AuthController.generateOTP(100000, 999999);
        await db
            .collection(collections.ONE_TIME_PASSWORDS)
            .updateOne({ email }, { $set: { email, otp, createdAt: new Date() } }, { upsert: true });
        await NodeMailerService.sendOTPVerificationMail(email, otp);
        return { status: HttpStatusCode.OK, body: { message: "OTP has been sent to provided email address." } };
    }

    public async signIn() {
        try {
            const bodySchema = Joi.object({
                email: Joi.string().trim().email().required(),
                password: Joi.string().min(8).max(30).required().disallow(" "),
            }).custom((value) => {
                if (!AuthController.isStrongPassword(value.password)) {
                    throw new Error("Password isn't strong.");
                }
                return value;
            });
            const {
                body: { email, password },
            } = await this.validateRequest({ bodySchema });
            const { status, body } = await AuthController.signIn(email, password);
            this.sendResponse(status, body);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    public static async signIn(email: string, password: string): Promise<APIResponse> {
        const db = await MongoDBService.getDB();
        const user = await db.collection<User>(collections.USERS).findOne({ email });
        if (!user) {
            throw new HttpError({ status: HttpStatusCode.NOT_FOUND, message: "The requested user doesn't exist" });
        }
        if (!AuthController.verifyPassword(password, user.password)) {
            throw new HttpError({ status: HttpStatusCode.UNAUTHORIZED, message: "Invalid credentials." });
        }
        const authorizationToken = AuthController.generateAuthorizationToken(email);
        return { status: HttpStatusCode.OK, body: authorizationToken };
    }

    public async createUser() {
        try {
            const bodySchema = Joi.object({
                email: Joi.string().trim().email().required(),
                password: Joi.string().min(8).max(30).required().disallow(" "),
                otp: Joi.number().min(100000).max(999999).required(),
            }).custom((value) => {
                if (!AuthController.isStrongPassword(value.password)) {
                    throw new Error("Password isn't strong.");
                }
                return value;
            });
            const {
                body: { email, password, otp },
            } = await this.validateRequest({ bodySchema });
            const { status, body } = await AuthController.createUser(email, password, otp);
            this.sendResponse(status, body);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private static async createUser(email: string, password: string, otp: number): Promise<APIResponse> {
        const db = await MongoDBService.getDB();
        const userDoc = await db.collection(collections.USERS).findOne({ email });
        if (userDoc) {
            throw new HttpError({ status: HttpStatusCode.CONFLICT });
        }
        const expiryTime = new Date(Date.now() - 5 * 60 * 1000); //Current Time - 5 Minutes
        const { deletedCount } = await db
            .collection<OneTimePassword>(collections.ONE_TIME_PASSWORDS)
            .deleteOne({ email, otp, createdAt: { $gte: expiryTime } });
        if (deletedCount === 0) {
            throw new HttpError({ status: HttpStatusCode.UNAUTHORIZED, message: "Invalid OTP" });
        }
        const hashedPassword = AuthController.generateHashedPassword(password);
        const authorizationToken = AuthController.generateAuthorizationToken(email);
        await db.collection(collections.USERS).insertOne({ email, password: hashedPassword, createdAt: new Date() });
        return { status: HttpStatusCode.CREATED, body: authorizationToken };
    }

    private static isStrongPassword(password: string): boolean {
        const specialCharacters = new Set<string>(["!", "@", "#", "$", "%", "^", "&", "*"]);
        let lower = false,
            upper = false,
            numeric = false,
            special = false;
        for (const char of password) {
            lower ||= char >= "a" && char <= "z";
            upper ||= char >= "A" && char <= "Z";
            numeric ||= char >= "0" && char <= "9";
            special ||= specialCharacters.has(char);
        }
        return lower && upper && numeric && special;
    }

    private static generateOTP(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    private static generateHashedPassword(password: string): HashedPassword {
        const iterations = 100000;
        const keyLength = 64;
        const digest = "sha256";
        const randomSalt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.pbkdf2Sync(password, randomSalt, iterations, keyLength, digest).toString("hex");
        return { salt: randomSalt, hash };
    }

    private static generateAuthorizationToken(email: string): AuthorizationToken {
        const accessToken = jwt.sign({ email }, config.JWT_ACCESS_TOKEN_KEY, { expiresIn: "1d" });
        const refreshToken = jwt.sign({ email }, config.JWT_REFRESH_TOKEN_KEY, { expiresIn: "7d" });
        return { accessToken, refreshToken };
    }

    private static verifyPassword(enteredPassword: string, password: HashedPassword): boolean {
        const iterations = 100000;
        const keyLength = 64;
        const digest = "sha256";
        const enteredPasswordHash = crypto
            .pbkdf2Sync(enteredPassword, password.salt, iterations, keyLength, digest)
            .toString("hex");
        return enteredPasswordHash === password.hash;
    }
}
