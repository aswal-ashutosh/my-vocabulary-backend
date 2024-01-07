import Joi from "joi";

declare global {
    namespace Express {
        interface Request {
            userInfo?: { email: string };
        }
    }
}

export interface RequestValidationSchema {
    bodySchema?: Joi.AnySchema;
    paramsSchema?: Joi.AnySchema;
    querySchema?: Joi.AnySchema;
}

export interface ValidatedRequestData {
    body: any;
    params: any;
    query: any;
}

export interface APIResponse {
    status: HttpStatusCode;
    body?: any;
}

export interface HashedPassword {
    salt: string;
    hash: string;
}

export interface AuthorizationToken {
    accessToken: string;
    refreshToken: string;
}

export interface JWTPayload {
    email: string
}