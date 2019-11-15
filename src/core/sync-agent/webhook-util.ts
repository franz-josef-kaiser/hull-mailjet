import _ from "lodash";
import LoggingUtil from "../../utils/logging-util";
import { IMailjetEventCallbackUrlCreate, IMailjetEventCallbackUrl, IEventCallbackUrlConfig, IMailjetPagedResult } from "../mailjet-objects";
import MailjetClient from "../mailjet-client";
import { ERROR_WEBHOOK_FAILEDTOCREATE, ERROR_WEBHOOK_FAILEDTORETRIEVELIST } from "../constants";
import { ApiCommunicationError } from "../errors/index";
import asyncForEach from "../../utils/async-foreach";

class WebhookUtil {
    private _logUtil: LoggingUtil;
    private _svcClient: MailjetClient;

    constructor(mjClient: MailjetClient, logUtil: LoggingUtil) {
        this._logUtil = logUtil;
        this._svcClient = mjClient;
    }

    public async ensureWebhooksRegistered(config: IEventCallbackUrlConfig) {
        try {
            this._logUtil.incrementApiCallsMetric();
            const allEventCallbacksApiResult = await this._svcClient.listEventCallbacks();

            if (allEventCallbacksApiResult.success === false) {
                throw new ApiCommunicationError(allEventCallbacksApiResult, ERROR_WEBHOOK_FAILEDTORETRIEVELIST);
            }

            const eventCallbackUrl = `${config.connectorUrl.protocol}//${config.baUser}:${config.baPass}@${config.connectorUrl.host}/eventcallback?org=${config.homepageUrl.host}`;
            const actionsForEventCallbacks: { creates: IMailjetEventCallbackUrlCreate[], deletes: IMailjetEventCallbackUrl[] } = { creates: [], deletes: [] };

            const registeredCallbacks: IMailjetEventCallbackUrl[] = 
                _.filter((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, { Url : eventCallbackUrl });
            const registeredCallbacksDifferentHost: IMailjetEventCallbackUrl[] = 
                this.filterCallbacksWithDiffHost((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, config, eventCallbackUrl);
            // Add all the incorrectly registered webhooks to the deletion list
            actionsForEventCallbacks.deletes.push(...registeredCallbacksDifferentHost);
            // Diff the remainder
            this.diffRegisteredVsDesired(registeredCallbacks, config, eventCallbackUrl, actionsForEventCallbacks);
            // Delete the callbacks not needed
            let hasDeletionFailed = false;
            await asyncForEach(actionsForEventCallbacks.deletes, async(ec: IMailjetEventCallbackUrl) => {
                const success = await this.unregisterWebhook(ec);
                if (success === false) { hasDeletionFailed = true; }
            });
            // @ts-ignore
            if(hasDeletionFailed === true) { return; }
            await asyncForEach(actionsForEventCallbacks.creates, async(ec: IMailjetEventCallbackUrlCreate) => this.registerWebhook(ec));
            
        } catch (error) {
            this._logUtil.logConnectorOperation("error", "connector.webhook.error", { 
                error
            });
        }
    }

    public async unregisterAllWebhooks(config: IEventCallbackUrlConfig) {
        try {
            this._logUtil.incrementApiCallsMetric();
            const allEventCallbacksApiResult = await this._svcClient.listEventCallbacks();

            if (allEventCallbacksApiResult.success === false) {
                throw new ApiCommunicationError(allEventCallbacksApiResult, ERROR_WEBHOOK_FAILEDTORETRIEVELIST);
            }

            const eventCallbackUrl = `${config.connectorUrl.protocol}//${config.baUser}:${config.baPass}@${config.connectorUrl.host}/eventcallback?org=${config.homepageUrl.host}`;
            const registeredCallbacks: IMailjetEventCallbackUrl[] = 
                _.filter((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, { Url : eventCallbackUrl });
            const registeredCallbacksDifferentHost: IMailjetEventCallbackUrl[] = 
                this.filterCallbacksWithDiffHost((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, config, eventCallbackUrl);
            
            await asyncForEach(_.concat(registeredCallbacks, registeredCallbacksDifferentHost), async(ec: IMailjetEventCallbackUrl) => this.unregisterWebhook(ec));
            
        } catch (error) {
            this._logUtil.logConnectorOperation("error", "connector.webhook.error", { 
                error
            });
        }
    }

    private filterCallbacksWithDiffHost(allCallbacks: IMailjetEventCallbackUrl[], config: IEventCallbackUrlConfig,eventCallbackUrl: string): IMailjetEventCallbackUrl[] {
        return _.filter(allCallbacks, (ec: IMailjetEventCallbackUrl) => {
            return ec.Url !== eventCallbackUrl &&
                ec.Url.indexOf(`//${config.baUser}:${config.baPass}@`) !== -1 &&
                ec.Url.indexOf(config.homepageUrl.host) !== -1;
        });
    }

    private diffRegisteredVsDesired(registeredCallbacks: IMailjetEventCallbackUrl[], config: IEventCallbackUrlConfig,eventCallbackUrl: string, actionsForEventCallbacks: { creates: IMailjetEventCallbackUrlCreate[], deletes: IMailjetEventCallbackUrl[] }): void {
        // Diff the desired vs the registered callbacks
        _.forEach(config.desiredEventTypes, (et) => {
            if (_.isNil(_.find(registeredCallbacks, { EventType: et }))) {
                actionsForEventCallbacks.creates.push({
                    EventType: et,
                    IsBackup: false,
                    Status: "alive",
                    Url: eventCallbackUrl
                });
            }
        });

        // Diff the desired vs the registered callbacks
        _.forEach(registeredCallbacks, (ec) => {
            if(!_.includes(config.desiredEventTypes, ec.EventType)) {
                actionsForEventCallbacks.deletes.push(ec);
            }
        });
    }

    private async registerWebhook(ecToCreate: IMailjetEventCallbackUrlCreate):Promise<boolean> {
        this._logUtil.incrementApiCallsMetric();
        const apiResult = await this._svcClient.createEventCallback(ecToCreate);
        if (apiResult.success === true) {
            this._logUtil.logConnectorOperation("debug", "connector.webhook.success", { apiResult });
        } else {
            this._logUtil.logConnectorOperation("error", "connector.webhook.error", { 
                reason: ERROR_WEBHOOK_FAILEDTOCREATE,
                apiResult
            });
        }
        return apiResult.success;
    }

    private async unregisterWebhook(ecToDel: IMailjetEventCallbackUrl):Promise<boolean> {
        this._logUtil.incrementApiCallsMetric();
        const apiResult = await this._svcClient.deleteEventCallback(ecToDel.ID);
        if (apiResult.success === true) {
            this._logUtil.logConnectorOperation("debug", "connector.webhook.success", { apiResult });
        } else {
            this._logUtil.logConnectorOperation("error", "connector.webhook.error", { 
                reason: ERROR_WEBHOOK_FAILEDTOCREATE,
                apiResult
            });
        }
        return apiResult.success;
    }


}

export default WebhookUtil;