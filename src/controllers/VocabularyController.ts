import Joi from "joi";
import Controller from "./Controller";
import { Request, Response } from "express";
import { Word } from "../models/mongo-models";
import { APIResponse } from "../types";
import MongoDBService from "../services/MongoDBService";
import collections from "../constants/mongodb-collections";
import HttpStatusCode from "../constants/http-status-codes";
import { Db, ObjectId } from "mongodb";
import HttpError from "../customs/HttpError";

export default class VocabularyController extends Controller {
    constructor(req: Request, res: Response) {
        super(req, res);
    }

    public async addWord() {
        try {
            const notEmptyStringSchema = Joi.string().not().empty();
            const bodySchema = Joi.object({
                word: notEmptyStringSchema.required(),
                definitions: Joi.array().items(notEmptyStringSchema).min(1).required(),
                sentences: Joi.array().items(notEmptyStringSchema).max(10).required(),
                similarWords: Joi.array().items(notEmptyStringSchema).max(10).required(),
                oppositeWords: Joi.array().items(notEmptyStringSchema).max(10).required(),
            });
            const { body: word } = await this.validateRequest({ bodySchema });
            const email: string = this.userInfo()!.email;
            const { status, body } = await VocabularyController.addWord(word, email);
            this.sendResponse(status, body);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private static async addWord(word: Word, email: string): Promise<APIResponse> {
        const db = await MongoDBService.getDB();
        const { insertedId } = await db
            .collection<Word>(collections.WORDS)
            .insertOne({ ...word, createdBy: email, createdAt: new Date() });
        word._id = insertedId;
        return { status: HttpStatusCode.CREATED, body: word };
    }

    public async updateWord() {
        try {
            const notEmptyStringSchema = Joi.string().not().empty();
            const bodySchema = Joi.object({
                word: notEmptyStringSchema,
                definitions: Joi.array().items(notEmptyStringSchema).min(1),
                sentences: Joi.array().items(notEmptyStringSchema).max(10),
                similarWords: Joi.array().items(notEmptyStringSchema).max(10),
                oppositeWords: Joi.array().items(notEmptyStringSchema).max(10),
            }).min(1);
            const paramsSchema = Joi.object({ _id: Joi.string().hex().length(24) });
            const {
                body: word,
                params: { _id },
            } = await this.validateRequest({ bodySchema, paramsSchema });
            const email: string = this.userInfo()!.email;
            const { status, body } = await VocabularyController.updateWord(new ObjectId(_id), word, email);
            this.sendResponse(status, body);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private static async updateWord(_id: ObjectId, word: Word, email: string): Promise<APIResponse> {
        const db = await MongoDBService.getDB();
        const wordDoc = await db
            .collection<Word>(collections.WORDS)
            .findOneAndUpdate(
                { _id, createdBy: email },
                { $set: word },
                { projection: { createdBy: 0 }, returnDocument: "after" }
            );
        if (!wordDoc) {
            return new HttpError({ status: HttpStatusCode.NOT_FOUND });
        }
        return { status: HttpStatusCode.OK, body: wordDoc };
    }

    public async getWords() {
        try {
            const querySchema = Joi.object({
                page: Joi.number().min(1).required(),
                pageSize: Joi.number().min(1).max(10).required(),
            });
            const {
                query: { page, pageSize },
            } = await this.validateRequest({ querySchema });
            const email = this.userInfo()!.email;
            const { status, body } = await VocabularyController.getWords(page, pageSize, email);
            this.sendResponse(status, body);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private static async getWords(page: number, pageSize: number, createdBy: string): Promise<APIResponse> {
        const db = await MongoDBService.getDB();
        const words: Word[] = await db
            .collection<Word>(collections.WORDS)
            .find({ createdBy })
            .sort({ word: 1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .project<Word>({ createdBy: 0 })
            .toArray();
        return { status: HttpStatusCode.OK, body: words };
    }
}
