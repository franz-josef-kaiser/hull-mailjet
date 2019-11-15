import _ from "lodash";

import IHullUserUpdateMessage from "../types/user-update-message";
import IHullClient from "../types/hull-client";
import IPrivateSettings from "../types/private-settings";
import MailjetClient from "./mailjet-client";
import IMailjetClientConfig from "./mailjet-client-config";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IOperationEnvelope, IMailjetListRecipient, IMailjetContact, IMailjetContactData, IMailjetContactListAction, IMailjetEvent, MailJetEventType, IMailjetEventCallbackUrlCreate, IMailjetEventCallbackUrl } from "./mailjet-objects";
import FilterUtil from "../utils/filter-util";
import MappingUtil from "../utils/mapping-util";
import asyncForEach from "../utils/async-foreach";
import IApiResultObject from "../types/api-result";
import { STATUS_NOPRIVATESETTINGS, STATUS_NOAUTHN_APIKEY, STATUS_NOAUTHN_APISECRETKEY, MJ_EVENT_MAPPING, ERROR_INCOMING_EVENT_UNKNOWN, ERROR_WEBHOOK_FAILEDTORETRIEVELIST, ERROR_WEBHOOK_FAILEDTODELETE } from "./constants";
import { IHullConnector } from "../types/connector";
import LoggingUtil from "../utils/logging-util";
import MailjetEventUtil from "./sync-agent/mjevent-util";
import WebhookUtil from "./sync-agent/webhook-util";
import OutgoingUserHandler from "./sync-agent/outgoing-user-handler";

class SyncAgent {

    private _hullClient: IHullClient;
    private _metricsClient: any;
    private _connector: IHullConnector;
    private _svcClientConfig: IMailjetClientConfig;
    private _svcClient: MailjetClient;
    private _filterUtil: FilterUtil;
    private _mappingUtil: MappingUtil;
    private _logUtil: LoggingUtil;
    private _mjEventUtil: MailjetEventUtil;
    private _webhookUtil: WebhookUtil;
    private _outgoingUsrHandler: OutgoingUserHandler;

    /**
     * Creates an instance of SyncAgent.
     * @param {IHullClient} client The Hull client.
     * @param {*} connector The Hull connector.
     * @param {*} metricsClient The metrics client.
     * @memberof SyncAgent
     */
    constructor(client: IHullClient, connector: any, metricsClient: any) {
        // Destructure hull clients
        this._hullClient = client;
        this._metricsClient = metricsClient;
        this._connector = connector;
        // Obtain the private settings from the connector and run some basic checks
        const privateSettings: IPrivateSettings = _.get(connector, "private_settings", { 
            contact_synchronized_segments: [],
            contact_attributes_outbound: []
        }) as IPrivateSettings;
        
        // Configure the Mailjet Client
        this._svcClientConfig = {
            apiKey: privateSettings.api_key || "",
            apiSecretKey: privateSettings.api_secret_key || ""
        };
        this._svcClient = new MailjetClient(this._svcClientConfig);
        // Configure the utilities
        this._filterUtil = new FilterUtil(privateSettings);
        this._mappingUtil = new MappingUtil(privateSettings);
        this._logUtil = new LoggingUtil(this._hullClient, this._metricsClient);
        this._mjEventUtil = new MailjetEventUtil(this._hullClient, this._mappingUtil, this._logUtil);
        this._webhookUtil = new WebhookUtil(this._svcClient, this._logUtil);
        this._outgoingUsrHandler = new OutgoingUserHandler(this._hullClient, this._svcClient, this._mappingUtil, this._logUtil);
    }

    /**
     * Handles outgoing traffic for Hull users.
     *
     * @param {IHullUserUpdateMessage[]} messages The smart notifier messages.
     * @param {boolean} [isBatch=false] True if batch operation; otherwise false.
     * @returns {Promise<any>} A Promise which can be awaited.
     * @memberof SyncAgent
     */
    public async sendUserMessages(messages: IHullUserUpdateMessage[], isBatch: boolean = false): Promise<any> {
        if (this.isAuthNConfigured() === false) {
            return Promise.resolve(true);
        }

        // [STEP 1] Filter messages
        const filteredEnvelopes = this._filterUtil.filterUserMessages(messages, isBatch);
        const envelopesToSkip = _.filter(filteredEnvelopes, (envelope) => {
            return envelope.operation === "skip";
        });
        const envelopesToProcess = _.filter(filteredEnvelopes, (envelope) => {
            return envelope.operation !== "skip";
        });

        _.forEach(envelopesToSkip, (envelope) => {
            this._logUtil.logConnectorOperationForUser("debug", envelope, "outgoing.user.skip", { reason: envelope.reason });
        });

        if (envelopesToProcess.length === 0) {
            return Promise.resolve(true);
        }

        await asyncForEach(envelopesToProcess, async (env: IOperationEnvelope) => this._outgoingUsrHandler.process(env));
    }

    /**
     * Returns up to 100 custom contact properties.
     *
     * @returns {Promise<IMailjetContactProperty[]>} The custom contact properties.
     * @memberof SyncAgent
     */
    public async getMetadataContactProperties(): Promise<IMailjetContactProperty[]> {
        let hasMore = true;
        let offset = 0;
        const limit = 100;
        const result: IMailjetContactProperty[] = [];
        
        while (hasMore === true) {
            this._logUtil.incrementApiCallsMetric();
            const apiResult = await this._svcClient.getMetadataContactProperties(offset, limit);
            hasMore = (apiResult.data as IMailjetPagedResult<IMailjetContactProperty>).Count === limit;
            offset += limit;
            result.push(...(apiResult.data as IMailjetPagedResult<IMailjetContactProperty>).Data);
        }
        
        return result;
    }

    /**
     * Returns up to 100 contact lists from Mailjet.
     *
     * @returns {Promise<IMailjetContactList[]>} The contact lists.
     * @memberof SyncAgent
     */
    public async getContactLists(): Promise<IMailjetContactList[]> {
        let hasMore = true;
        let offset = 0;
        const limit = 100;
        const result: IMailjetContactList[] = [];

        while (hasMore === true) {
            this._logUtil.incrementApiCallsMetric();
            const apiResult = await this._svcClient.getContactLists(offset, limit);
            hasMore = (apiResult.data as IMailjetPagedResult<IMailjetContactList>).Count === limit;
            offset += limit;
            result.push(...(apiResult.data as IMailjetPagedResult<IMailjetContactList>).Data);
        }
        
        return result;
    }

    /**
     * Determines whether authentication settings are
     * filled and the connector can potentially 
     * communicate with Mailjet.
     *
     * @returns {boolean}
     * @memberof SyncAgent
     */
    public isAuthNConfigured(): boolean {
        return this._svcClientConfig.apiKey !== "" &&
                this._svcClientConfig.apiSecretKey !== "";
    }

    /**
     * Determines the connector status and sets it via PUT on the connector instance.
     *
     * @returns {Promise<{ status: string, messages: string[]}>} The connector status.
     * @memberof SyncAgent
     */
    public async determineConnectorStatus(): Promise<{ status: string, messages: string[]}> {
        const statusResponse: { status: string, messages: string[] } = {
            status: "ok",
            messages: []
        };

        const privateSettings: IPrivateSettings | undefined = _.get(this._connector, "private_settings", undefined);

        if (this.isAuthNConfigured() === false) {
            statusResponse.status = "setupRequired";
            if (privateSettings !== undefined) {
                if (_.isNil(privateSettings.api_key) === true ||
                    (_.isNil(privateSettings.api_key) === false && privateSettings.api_key === "")) {
                        statusResponse.messages.push(STATUS_NOAUTHN_APIKEY);
                }

                if (_.isNil(privateSettings.api_secret_key) === true ||
                    (_.isNil(privateSettings.api_secret_key) === false && privateSettings.api_secret_key === "")) {
                        statusResponse.messages.push(STATUS_NOAUTHN_APISECRETKEY);
                }

            } else {
                // We cannot determine what is missing, so return a more generic error message
                statusResponse.messages.push(STATUS_NOPRIVATESETTINGS);
            }
        }

        if (statusResponse.status !== "setupRequired") {
            // TODO: Perform additional health checks here
        }

        // Make the status available in the dashboard
        await this._hullClient.put(`${this._connector.id}/status`, statusResponse);

        return statusResponse;
    }

    /**
     * Handles the payload of event callbacks received from Mailjet.
     *
     * @param {(IMailjetEvent | IMailjetEvent[])} eventCallbacks The payload, either a single action or an array of actions.
     * @returns {Promise<boolean>} A promise indicating success.
     * @memberof SyncAgent
     */
    public async handleEventCallbacks(eventCallbacks: IMailjetEvent | IMailjetEvent[]): Promise<boolean> {
        const mjEvents: IMailjetEvent[] = [];

        if (_.isArray(eventCallbacks)) {
            mjEvents.push(...eventCallbacks);
        } else {
            mjEvents.push(eventCallbacks);
        }
            
        await asyncForEach(mjEvents, async (mjEvent: IMailjetEvent) => this._mjEventUtil.processEvent(mjEvent));
        
        return Promise.resolve(true);
    }

    /**
     * Ensures that Event Callback URLs are properly configured in Mailjet.
     * Missing callbacks will be created and incorrect or obsolete ones will be removed.
     *
     * @param {boolean} [forceSettingsRefresh=true] True to force refresh the settings via HullClient.get("app")
     * @returns {Promise<boolean>} A promise indicating success.
     * @memberof SyncAgent
     */
    public async ensureEventCallbackUrls(forceSettingsRefresh: boolean = true): Promise<boolean> {
        if (this.isAuthNConfigured() === false) {
            return Promise.resolve(true);
        }
        let connectorUrl = new URL(this._connector.source_url);
        let homepageUrl = new URL(this._connector.homepage_url as string);
        let baUser = this._connector.id;
        let baPass = this._connector.secret;
        let desiredEventTypes: MailJetEventType[] = this._connector.private_settings.incoming_eventcallbackurl_eventtypes || [];
        // WARNING: Smart-notifier payload is bogus and sending some outdated settings,
        // so fetch the latest version via hull-node
        if (forceSettingsRefresh === true) {
            const connRes = await this._hullClient.get("app");
            connectorUrl = new URL(_.get(connRes, 'source_url', this._connector.source_url));
            homepageUrl = new URL(_.get(connRes,'homepage_url', this._connector.homepage_url as string));
            baUser = _.get(connRes, 'id', baUser);
            baPass = _.get(connRes, 'secret', baPass);
            desiredEventTypes = _.get(connRes, "private_settings.incoming_eventcallbackurl_eventtypes", []);
        }

        await this._webhookUtil.ensureWebhooksRegistered({
            baPass,
            baUser,
            connectorUrl,
            desiredEventTypes,
            homepageUrl
        });

        return Promise.resolve(true);
    }

    /**
     * Deletes all event callback URLs from Mailjet
     * and removes all event types from private_settings.
     *
     * @returns {Promise<boolean>} A promise indicating success.
     * @memberof SyncAgent
     */
    public async clearEventCallbackUrls(): Promise<boolean> {
        if (this.isAuthNConfigured() === false) {
            return Promise.resolve(true);
        }
        await this._hullClient.utils.settings.update({
            incoming_eventcallbackurl_eventtypes: []
        });
        const connectorUrl = new URL(this._connector.source_url);
        const homepageUrl = new URL(this._connector.homepage_url as string);
        const baUser = this._connector.id;
        const baPass = this._connector.secret;

        await this._webhookUtil.unregisterAllWebhooks({
            baPass,
            baUser,
            connectorUrl,
            desiredEventTypes: [],
            homepageUrl
        });
        return true;
    }
}

export default SyncAgent;