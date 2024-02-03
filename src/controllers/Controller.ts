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
            error = new HttpError({ message: error.message, status: HttpStatusCode.INTERNAL_SERVER_ERROR });
        }
        const { message, status, path } = error as HttpError;
        let errorPayload: { message?: string; path?: (string | number)[] } = {};
        if (message) {
            errorPayload.message = message;
        }
        if (path) {
            errorPayload.path = path;
        }
        if (Object.keys(errorPayload).length) {
            this.res.status(status).json(errorPayload);
        } else {
            this.res.sendStatus(status);
        }
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
                const [{ message, path }] = error.details;
                throw new HttpError({
                    message: message,
                    status: HttpStatusCode.BAD_REQUEST,
                    path: path.slice(1, path.length),
                });
            }
            throw error;
        }
    }

    userInfo() {
        return this.req.userInfo;
    }
}
