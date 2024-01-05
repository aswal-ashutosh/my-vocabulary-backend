import Joi from "joi";

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
