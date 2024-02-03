import HttpStatusCode from "../constants/http-status-codes";

export default class HttpError extends Error {
    public readonly status: HttpStatusCode;
    public readonly path?: (string | number)[];

    constructor({ message, status, path }: { message?: string; status: HttpStatusCode; path?: (string | number)[] }) {
        super(message);
        this.status = status;
        this.path = path;
    }
}
