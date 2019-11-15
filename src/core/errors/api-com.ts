import { ERROR_API_GENERIC } from "../constants";

export class ApiCommunicationError extends Error {
    public apiResult: any;
    public reason: string;

    constructor(apiResult: any, message?: string) {
        super(message); // 'Error' breaks prototype chain here
        this.name = "ApiCommunicationError";
        this.reason = message === undefined ? ERROR_API_GENERIC : message;
        this.apiResult = apiResult;
    }
}