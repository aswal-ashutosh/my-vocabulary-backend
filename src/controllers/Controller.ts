import { Request, Response } from "express";
import { RequestValidationSchema, ValidatedRequestData } from "../types";
import Joi from "joi";
import HttpError from "../customs/HttpError";
import HttpStatusCode from "../constants/http-status-codes";

export default abstract class Controller {
    constructor(private readonly req: Request, private readonly res: Response) {}

    sendResponse(status: number, body?: any) {
        if (body) {
            this.res.status(status).json(body);
        } else {
            this.res.sendStatus(status);
        }
    }

    handleError(error: Error | HttpError) {
        if (!(error instanceof HttpError)) {
            error = HttpError.fromError(error);
        }
        const { message, status } = error as HttpError;
        this.res.status(status).json({ error: message });
    }

    async validateRequest({
        bodySchema = Joi.any(),
        paramsSchema = Joi.any(),
        querySchema = Joi.any(),
    }: RequestValidationSchema = {}): Promise<ValidatedRequestData> {
        try {
            const schema = Joi.object({ body: bodySchema, params: paramsSchema, query: querySchema });
            const { body, params, query } = this.req;
            return await schema.validateAsync({ body, params, query });
        } catch (error: any) {
            if (error instanceof Joi.ValidationError) {
                throw new HttpError({ message: error.details[0].message, status: HttpStatusCode.BAD_REQUEST });
            }
            throw error;
        }
    }
}
