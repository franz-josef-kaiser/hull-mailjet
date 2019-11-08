import _ from "lodash";

import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";
import IHullClient from "../types/hull-client";
import IPrivateSettings from "../types/private-settings";
import MailjetClient from "./mailjet-client";
import IMailjetClientConfig from "./mailjet-client-config";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IOperationEnvelope, IMailjetListRecipient, IMailjetContact, IMailjetContactData, IMailjetContactListAction } from "./mailjet-objects";
import FilterUtil from "../utils/filter-util";
import MappingUtil from "../utils/mapping-util";
import asyncForEach from "../utils/async-foreach";
import IApiResultObject from "../types/api-result";

class SyncAgent {

    private _hullClient: IHullClient;
    private _metricsClient: any;
    private _connector: any;
    private _svcClientConfig: IMailjetClientConfig;
    private _svcClient: MailjetClient;
    private _filterUtil: FilterUtil;
    private _mappingUtil: MappingUtil;

    constructor(client: IHullClient, connector: any, metricsClient: any) {
        // Destructure hull clients
        this._hullClient = client;
        this._metricsClient = metricsClient;
        this._connector = connector;
        // Obtain the private settings from the connector and run some basic checks
        const privateSettings: IPrivateSettings = _.get(connector, "private_settings") as IPrivateSettings;
        
        // Configure the Mailjet Client
        this._svcClientConfig = {
            apiKey: privateSettings.api_key || "",
            apiSecretKey: privateSettings.api_secret_key || ""
        }
        this._svcClient = new MailjetClient(this._svcClientConfig);
        // Configure the utilities
        this._filterUtil = new FilterUtil(privateSettings);
        this._mappingUtil = new MappingUtil(privateSettings);
    }

    public async sendUserMessages(messages: IHullUserUpdateMessage[], isBatch: boolean = false): Promise<any> {
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
                
                // tslint:disable-next-line:no-console
                console.log(env);

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
                    const contactApiResult = await this._svcClient.updateContact(env.serviceContactCreate.Email, env.serviceContactCreate);
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

    public isAuthNConfigured() {
        return this._svcClientConfig.apiKey !== "" &&
                this._svcClientConfig.apiSecretKey !== "";
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

    private handleOutgoingError(envelope: IOperationEnvelope, message: string, error: any) {
        const userIdent = _.pick((envelope.msg as IHullUserUpdateMessage).user, ["id", "external_id", "email"]);
        this._hullClient.asUser(userIdent)
            .logger
            .error(message, { error });
    }
}

export default SyncAgent;