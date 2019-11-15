import _ from "lodash";
import IHullClient from "../types/hull-client";
import { IOperationEnvelope, ConnectorLogLevel } from "../core/mailjet-objects";
import IApiResultObject from "../types/api-result";
import IHullUserUpdateMessage from "../types/user-update-message";
import { LOGGING_METRICS_APICALL } from "../core/constants";
import { IHullUserClaims } from "../types/user";

class LoggingUtil {
    private _hullClient: IHullClient;
    private _metricsClient: any;

    /**
     * Creates an instance of LoggingUtil.
     * @param {IHullClient} hullClient The Hull Client to use for logging.
     * @memberof LoggingUtil
     */
    constructor(hullClient: IHullClient, metricsClient: any) {
        this._hullClient = hullClient;
        this._metricsClient = metricsClient;
    }

    /**
     * Logs an API result for the outgoing data flow.
     *
     * @template T The type of the data object of the api result.
     * @template U The type of the record object of the api result.
     * @param {IOperationEnvelope} envelope The operation envelope.
     * @param {IApiResultObject<T, U>} apiResult The result of the API call.
     * @memberof LoggingUtil
     */
    public logOutgoingApiResultForUser<T, U>(envelope: IOperationEnvelope, apiResult: IApiResultObject<T, U>): void {
        const userIdent = _.pick((envelope.msg as IHullUserUpdateMessage).user, ["id", "external_id", "email"]);
        const message = `outgoing.user.${apiResult.success ? 'success' : 'error'}`;
        if (apiResult.success) {
            this._hullClient.asUser(userIdent)
                .logger
                .debug(message, apiResult);
        } else {
            this._hullClient.asUser(userIdent)
                .logger
                .error(message, apiResult);
        }
    }

    /**
     * Logs an unhandled error for the outgoing data flow.
     *
     * @param {IOperationEnvelope} envelope The operation envelope.
     * @param {string} message The log level message.
     * @param {Error} error The error object.
     * @memberof LoggingUtil
     */
    public logUnhandledOutgoingErrorForUser(envelope: IOperationEnvelope, message: string, error: Error) {
        const userIdent = _.pick((envelope.msg as IHullUserUpdateMessage).user, ["id", "external_id", "email"]);
        this._hullClient.asUser(userIdent)
            .logger
            .error(message, { errorMessage: error.message, errorName: error.name });
    }

    public logConnectorOperationForUser(level: ConnectorLogLevel, envelope: IOperationEnvelope, message: string, payload: any): void {
        const userIdent = _.pick((envelope.msg as IHullUserUpdateMessage).user, ["id", "external_id", "email"]);
        const scopedClient = _.keys(userIdent).length === 0 ? this._hullClient : this._hullClient.asUser(userIdent);
        scopedClient.logger[level](message, payload);
    }

    public logConnectorOperation(level: ConnectorLogLevel, message: string, payload: any, userIdent?: IHullUserClaims | undefined): void {
        const scopedClient = userIdent === undefined ? this._hullClient : this._hullClient.asUser(userIdent);
        scopedClient.logger[level](message, payload);
    }

    /**
     * Increments the metric for API calls by the number specified.
     *
     * @param {number} [numberOfCalls=1] The number of executed API calls, defaults to one.
     * @returns {void}
     * @memberof LoggingUtil
     */
    public incrementApiCallsMetric(numberOfCalls: number = 1): void {
        if (this._metricsClient === undefined) {
            return;
        }

        this._metricsClient.increment(LOGGING_METRICS_APICALL, numberOfCalls);
    }

}

export default LoggingUtil;