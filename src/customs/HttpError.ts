import HttpStatusCode from "../constants/http-status-codes";

export default class HttpError extends Error {
    public readonly status: HttpStatusCode;

    constructor({ message, status }: { message?: string; status: HttpStatusCode }) {
        super(message);
        this.status = status;
    }

    public static fromError(error: Error, status: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR) {
        return new HttpError({ message: error.message, status });
    }
}
