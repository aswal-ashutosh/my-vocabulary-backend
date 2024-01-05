import HttpStatusCode from "../constants/http-status-codes";

export default class HttpError extends Error {
    public readonly statusCode: HttpStatusCode;

    constructor({ message = "", statusCode }: { message?: string; statusCode: HttpStatusCode }) {
        super(message);
        this.statusCode = statusCode;
    }

    public static fromError(error: Error, statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR) {
        return new HttpError({ message: error.message, statusCode });
    }
}
