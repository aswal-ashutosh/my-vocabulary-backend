import Joi from "joi";

export interface RequestValidationSchema {
    bodySchema?: Joi.AnySchema,
    paramsSchema?: Joi.AnySchema,
    querySchema?: Joi.AnySchema,
}