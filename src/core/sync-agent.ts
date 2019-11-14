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

class SyncAgent {

    private _hullClient: IHullClient;
    private _metricsClient: any;
    private _connector: IHullConnector;
    private _svcClientConfig: IMailjetClientConfig;
    private _svcClient: MailjetClient;
    private _filterUtil: FilterUtil;
    private _mappingUtil: MappingUtil;

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
            const userIdent = _.pick(_.get(envelope, "msg.user"), ["id", "external_id", "email"]);
            this._hullClient.asUser(userIdent)
                .logger
                .debug("outgoing.user.skip", { reason: envelope.reason });
        });

        if (envelopesToProcess.length === 0) {
            return Promise.resolve(true);
        }

        await asyncForEach(envelopesToProcess, async (env: IOperationEnvelope) => {
            try {
                // [STEP 2] Transform Hull objects into Mailjet objects
                const mjIdent = (env.msg as IHullUserUpdateMessage).user.email as string;
                
                this._metricsClient.increment("ship.service_api.call", 1);
                const contactResult = await this._svcClient.getContact(mjIdent);
                this.handleOutgoingApiResult(env, contactResult);
                const contact = contactResult.success && (contactResult.data as IMailjetPagedResult<IMailjetContact>).Count === 1 ?
                    _.first((contactResult.data as IMailjetPagedResult<IMailjetContact>).Data) : undefined;

                let recipients: IMailjetListRecipient[] = [];
                if (contact !== undefined) {
                    // If no contact has been found for the email address,
                    // we save us an API call and do not query recipients at this point
                    this._metricsClient.increment("ship.service_api.call", 1);
                    const recipientsResult = await this._svcClient.getListRecipients(contact.ID);
                    this.handleOutgoingApiResult(env, recipientsResult);
                    recipients = recipientsResult.success ? 
                        (recipientsResult.data as IMailjetPagedResult<IMailjetListRecipient>).Data : [];
                }
                                
                env.serviceContact = contact;
                env.operation = contact === undefined ? "insert" : "update";
                env.serviceContactCreate = this._mappingUtil.mapHullUserToMailjetContactCreate((env.msg as IHullUserUpdateMessage).user);
                env.serviceContactData = this._mappingUtil.mapHullUserToMailjetContactData((env.msg as IHullUserUpdateMessage).user);
                env.serviceContactListActions = this._mappingUtil.mapHullSegmentsToContactListActions((env.msg as IHullUserUpdateMessage).segments, recipients);

                // [STEP 3] Execute API calls
                let performedApiCall: boolean = false;
                if (env.operation === "insert") {
                    this._metricsClient.increment("ship.service_api.call", 1);
                    performedApiCall = true;
                    const contactApiResult = await this._svcClient.createContact(env.serviceContactCreate);
                    this.handleOutgoingApiResult(env, contactApiResult);
                    env.serviceContact = contactApiResult.success && (contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Count === 1 ?
                        _.first((contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Data) : undefined;
                } else if(env.operation === "update" &&
                          env.serviceContact &&
                          env.serviceContactCreate &&
                          (env.serviceContact.Name !== env.serviceContactCreate.Name ||
                           env.serviceContact.IsExcludedFromCampaigns !== env.serviceContactCreate.IsExcludedFromCampaigns)) {
                    this._metricsClient.increment("ship.service_api.call", 1);
                    performedApiCall = true;
                    const contactApiResult = await this._svcClient.updateContact(env.serviceContactCreate.Email, 
                        _.pick(env.serviceContactCreate, ["IsExcludedFromCampaigns", "Name"]));
                    this.handleOutgoingApiResult(env, contactApiResult);
                    env.serviceContact = contactApiResult.success && (contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Count === 1 ?
                        _.first((contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Data) : undefined;
                }

                if (env.serviceContactData.Data.length !== 0 && env.serviceContact !== undefined) 
                {
                    this._metricsClient.increment("ship.service_api.call", 1);
                    performedApiCall = true;
                    const contactDataApiResult = await this._svcClient.updateContactData(env.serviceContact.ID, env.serviceContactData);
                    this.handleOutgoingApiResult(env, contactDataApiResult);
                    env.serviceContactData = contactDataApiResult.success ? _.first((contactDataApiResult.data as IMailjetPagedResult<IMailjetContactData>).Data) : undefined;
                }

                if (env.serviceContactListActions.ContactsLists.length !== 0 && env.serviceContact !== undefined) 
                {
                    this._metricsClient.increment("ship.service_api.call", 1);
                    performedApiCall = true;
                    const contactListSubscriptionsApiResult = await this._svcClient.manageContactListSubscriptions(env.serviceContact.ID, env.serviceContactListActions);
                    this.handleOutgoingApiResult(env, contactListSubscriptionsApiResult);
                    env.serviceContactListActions = contactListSubscriptionsApiResult.success ? { ContactsLists: (_.first((contactListSubscriptionsApiResult.data as IMailjetPagedResult<IMailjetContactListAction>).Data) as any) } : undefined;
                }

                if (performedApiCall && env.serviceContact !== undefined) {
                    // Make sure we have the latest data for the contact; the full list is not returned by updateContactData
                    this._metricsClient.increment("ship.service_api.call", 1);
                    const contactDataApiResult = await this._svcClient.getContactData(env.serviceContact.ID);
                    this.handleOutgoingApiResult(env, contactDataApiResult);
                    env.serviceContactData = contactDataApiResult.success ? _.first((contactDataApiResult.data as IMailjetPagedResult<IMailjetContactData>).Data) : undefined;
                    // Get the latest list recipients for the contact
                    this._metricsClient.increment("ship.service_api.call", 1);
                    const listRecipientsApiResult = await this._svcClient.getListRecipients(env.serviceContact.ID);
                    this.handleOutgoingApiResult(env, listRecipientsApiResult);
                    env.serviceContactRecipients = listRecipientsApiResult.success ? 
                        (listRecipientsApiResult.data as IMailjetPagedResult<IMailjetListRecipient>).Data : undefined;
                    
                    // [STEP 4] Call the Hull client to update the user
                    const userIdent = this._mappingUtil.mapMailjetContactToHullUserIdent(env.serviceContact, (env.msg as IHullUserUpdateMessage).user);
                    const userAttribs = this._mappingUtil.mapMailjetObjectsToHullUserAttributes(env.serviceContact, env.serviceContactData, env.serviceContactRecipients);

                    await this._hullClient.asUser(userIdent)
                              .traits(userAttribs);
                }

            } catch (error) {
                // At this point it is an unknown error, so something which 
                // indicates a real error not just an API error
                this.handleOutgoingError(env, "outgoing.user.error", error);
            }

            
        });
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
            this._metricsClient.increment("ship.service_api.call", 1);
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
            this._metricsClient.increment("ship.service_api.call", 1);
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
        let isSuccess = true;
        try {
            if (_.isArray(eventCallbacks)) {
                mjEvents.push(...eventCallbacks);
            } else {
                mjEvents.push(eventCallbacks);
            }
            
            await asyncForEach(mjEvents, async (mjEvent: IMailjetEvent) => {
                const userIdent = this._mappingUtil.mapMailjetEventToHullUserIdent(mjEvent);
                if(_.includes(_.keys(MJ_EVENT_MAPPING), mjEvent.event) === false) {
                    this._hullClient.asUser(userIdent).logger.error("incoming.event.error", { 
                        reason: ERROR_INCOMING_EVENT_UNKNOWN,
                        event: mjEvent
                    });
                } else {
                    
                    const hullEvent = this._mappingUtil.mapMailjetEventToHullEvent(mjEvent);
                    // NOTE: Test events do have the mj_contact_id set to zero
                    if (mjEvent.mj_contact_id === 0) {
                        // Log it so the user can verify it
                        this._hullClient.logger.log("incoming.event.test", { ident: userIdent, event: hullEvent });
                    } else {
                        try {
                            await this._hullClient.asUser(userIdent).track(
                                hullEvent.event, 
                                hullEvent.properties, 
                                _.merge({}, hullEvent.context, {
                                    created_at: hullEvent.created_at,
                                    source: "mailjet"
                                }));
                            this._hullClient.asUser(userIdent).logger.debug("incoming.event.success", { event: hullEvent });   
                        } catch (error) {
                            this._hullClient.asUser(userIdent).logger.error("incoming.event.error", { event: hullEvent });
                        }
                    }
                }
            });
            
        } catch (error) {
            isSuccess = false;
            this._hullClient.logger.error("incoming.event.error", { error: JSON.stringify(error)});
        }
        
        return Promise.resolve(isSuccess);
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
        
        const eventCallbackUrl = `${connectorUrl.protocol}//${baUser}:${baPass}@${connectorUrl.host}/eventcallback?org=${homepageUrl.host}`;

        const actionsForEventCallbacks: { creates: IMailjetEventCallbackUrlCreate[], deletes: IMailjetEventCallbackUrl[] } = {
            creates: [],
            deletes: []
        };

        this._metricsClient.increment("ship.service_api.call", 1);
        const allEventCallbacksApiResult = await this._svcClient.listEventCallbacks();
        if (allEventCallbacksApiResult.success === false) {
            this._hullClient.logger.log("connector.webhook.error", {
                reason: ERROR_WEBHOOK_FAILEDTORETRIEVELIST,
                apiResult: allEventCallbacksApiResult
            });
            return Promise.resolve(false);
        }

        const registeredCallbacks: IMailjetEventCallbackUrl[] = 
            _.filter((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, (ec) => {
                return ec.Url === eventCallbackUrl;
            });
        const registeredCallbacksDifferentHost: IMailjetEventCallbackUrl[] = 
            _.filter((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, (ec) => {
                return ec.Url !== eventCallbackUrl &&
                       ec.Url.indexOf(`//${baUser}:${baPass}@`) !== -1 &&
                       ec.Url.indexOf(homepageUrl.host) !== -1;
            });
        
        // Add all the incorrectly registered webhooks to the deletion list
        _.forEach(registeredCallbacksDifferentHost, (ec) => {
            actionsForEventCallbacks.deletes.push(ec);
        });
        
        // Diff the desired vs the registered callbacks
        _.forEach(desiredEventTypes, (et) => {
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
            if(!_.includes(desiredEventTypes, ec.EventType)) {
                actionsForEventCallbacks.deletes.push(ec);
            }
        });

        let successfullyDeleted: boolean = true;
        await asyncForEach(actionsForEventCallbacks.deletes, async(ecToDel: IMailjetEventCallbackUrl) => {
            this._metricsClient.increment("ship.service_api.call", 1);
            const delResult = await this._svcClient.deleteEventCallback(ecToDel.ID);
            if(delResult.success === false) {
                successfullyDeleted = false;
                this._hullClient.logger.error(
                    "connector.webhook.error",
                    {
                        reason: ERROR_WEBHOOK_FAILEDTODELETE,
                        apiResult: delResult
                    }
                );
            } else {
                this._hullClient.logger.debug(
                    "connector.webhook.success",
                    {
                        apiResult: delResult
                    }
                );
            }
        });

        // NOTE: DO NOT create new webhooks if cleanup is not successful, otherwise we end up in a situation we
        //       cannot control and might have duplicate webhooks firing.

        // @ts-ignore Typescript doesn't consider asyncForEach so it will throw since it evaluates it always to `true`
        if (successfullyDeleted === false) { 
            return Promise.resolve(false) 
        }

        await asyncForEach(actionsForEventCallbacks.creates, async(ecToCreate: IMailjetEventCallbackUrlCreate) => {
            this._metricsClient.increment("ship.service_api.call", 1);
            const createResult = await this._svcClient.createEventCallback(ecToCreate);
            if(createResult.success === false) {
                successfullyDeleted = false;
                this._hullClient.logger.error(
                    "connector.webhook.error",
                    {
                        reason: ERROR_WEBHOOK_FAILEDTODELETE,
                        apiResult: createResult
                    }
                );
            } else {
                this._hullClient.logger.debug(
                    "connector.webhook.success",
                    {
                        apiResult: createResult
                    }
                );
            }
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

        this._metricsClient.increment("ship.service_api.call", 1);
        const allEventCallbacksApiResult = await this._svcClient.listEventCallbacks();
        if (allEventCallbacksApiResult.success === false) {
            this._hullClient.logger.log("connector.webhook.error", {
                reason: ERROR_WEBHOOK_FAILEDTORETRIEVELIST,
                apiResult: allEventCallbacksApiResult
            });
            return Promise.resolve(false);
        }

        const eventCallbackUrl = `${connectorUrl.protocol}//${baUser}:${baPass}@${connectorUrl.host}/eventcallback?org=${homepageUrl.host}`;

        const registeredCallbacks: IMailjetEventCallbackUrl[] = 
            _.filter((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, (ec) => {
                return ec.Url === eventCallbackUrl;
            });
        const registeredCallbacksDifferentHost: IMailjetEventCallbackUrl[] = 
            _.filter((allEventCallbacksApiResult.data as IMailjetPagedResult<IMailjetEventCallbackUrl>).Data, (ec) => {
                return ec.Url !== eventCallbackUrl &&
                       ec.Url.indexOf(`//${baUser}:${baPass}@`) !== -1 &&
                       ec.Url.indexOf(homepageUrl.host) !== -1;
            });
        
        await asyncForEach(_.concat(registeredCallbacks, registeredCallbacksDifferentHost), async(ecToDel: IMailjetEventCallbackUrl) => {
            this._metricsClient.increment("ship.service_api.call", 1);
            const delResult = await this._svcClient.deleteEventCallback(ecToDel.ID);
            if(delResult.success === false) {
                this._hullClient.logger.error(
                    "connector.webhook.error",
                    {
                        reason: ERROR_WEBHOOK_FAILEDTODELETE,
                        apiResult: delResult
                    }
                );
            } else {
                this._hullClient.logger.debug(
                    "connector.webhook.success",
                    {
                        apiResult: delResult
                    }
                );
            }
        });

        return true;
    }

    private handleOutgoingApiResult<T, U>(envelope: IOperationEnvelope, apiResult: IApiResultObject<T, U>) {
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

    private handleOutgoingError(envelope: IOperationEnvelope, message: string, error: Error) {
        const userIdent = _.pick((envelope.msg as IHullUserUpdateMessage).user, ["id", "external_id", "email"]);
        this._hullClient.asUser(userIdent)
            .logger
            .error(message, { errorMessage: error.message, errorName: error.name });
    }
}

export default SyncAgent;