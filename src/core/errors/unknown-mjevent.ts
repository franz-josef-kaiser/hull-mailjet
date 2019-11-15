import { ERROR_INCOMING_EVENT_UNKNOWN } from "../constants";

export class UnknownMailjetEventError extends Error {
    public receivedEvent: any;
    public reason: string;

    /**
     * Creates an instance of UnknownMailjetEventError.
     * @param {any} [receivedEvent] The received event.
     * @param {string} [message] The error message, if any.
     * @memberof UnknownMailjetEventError
     */
    constructor(receivedEvent: any, message?: string) {
        super(message); // 'Error' breaks prototype chain here
        this.name = "UnknownMailjetEventError";
        this.reason = message === undefined ? ERROR_INCOMING_EVENT_UNKNOWN : message;
        this.receivedEvent = receivedEvent;

    }
}
