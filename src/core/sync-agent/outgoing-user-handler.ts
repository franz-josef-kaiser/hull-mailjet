import _ from "lodash";
import LoggingUtil from "../../utils/logging-util";
import { IMailjetContact, IOperationEnvelope, IMailjetPagedResult, IMailjetListRecipient, IMailjetContactData, IMailjetContactListAction } from "../mailjet-objects";
import MailjetClient from "../mailjet-client";
import IHullUserUpdateMessage from "../../types/user-update-message";
import MappingUtil from "../../utils/mapping-util";
import IHullClient from "../../types/hull-client";

class OutgoingUserHandler {
    private _logUtil: LoggingUtil;
    private _svcClient: MailjetClient;
    private _mappingUtil: MappingUtil;
    private _hullClient: IHullClient;

    constructor(hullClient: IHullClient, mjClient: MailjetClient, mappingUtil: MappingUtil, logUtil: LoggingUtil) {
        this._hullClient = hullClient;
        this._logUtil = logUtil;
        this._mappingUtil = mappingUtil;
        this._svcClient = mjClient;
    }

    public async process(env: IOperationEnvelope) {
        try {
            env.serviceContact = await this.getUserForEmail(env);
            env.serviceContactRecipients = await this.getRecipients(env);
            this.mapHullObjects(env);
            if (env.operation === "insert") {
                await this.performInsert(env);
            } else if(env.operation === "update") {
                await this.performUpdate(env);
            }
            await this.performUpdateContactData(env);
            await this.performUpdateListSubscriptions(env);
            await this.performHullUpdate(env);
        } catch (error) {
            this._logUtil.logUnhandledOutgoingErrorForUser(env, "outgoing.user.error", error);
        }
    }

    private async getUserForEmail(env: IOperationEnvelope): Promise<IMailjetContact | undefined> {
        const mjIdent = (env.msg as IHullUserUpdateMessage).user.email as string;
        this._logUtil.incrementApiCallsMetric();
        const contactResult = await this._svcClient.getContact(mjIdent);
        this._logUtil.logOutgoingApiResultForUser(env, contactResult);
        
        if (contactResult.success && (contactResult.data as IMailjetPagedResult<IMailjetContact>).Count === 1) {
            return _.first((contactResult.data as IMailjetPagedResult<IMailjetContact>).Data);
        } else {
            return undefined;
        }
    }

    private async getRecipients(env: IOperationEnvelope): Promise<IMailjetListRecipient[]> {
        if (env.serviceContact === undefined) {
            return [];
        }

        this._logUtil.incrementApiCallsMetric();
        const recipientsResult = await this._svcClient.getListRecipients(env.serviceContact.ID);
        this._logUtil.logOutgoingApiResultForUser(env, recipientsResult);
        if (recipientsResult.success === true) {
            return (recipientsResult.data as IMailjetPagedResult<IMailjetListRecipient>).Data;
        } 
        return [];
    }

    private mapHullObjects(env: IOperationEnvelope) {
        env.operation = env.serviceContact === undefined ? "insert" : "update";
        env.serviceContactCreate = this._mappingUtil.mapHullUserToMailjetContactCreate((env.msg as IHullUserUpdateMessage).user);
        env.serviceContactData = this._mappingUtil.mapHullUserToMailjetContactData((env.msg as IHullUserUpdateMessage).user);
        env.serviceContactListActions = this._mappingUtil.mapHullSegmentsToContactListActions((env.msg as IHullUserUpdateMessage).segments, env.serviceContactRecipients || []);
    }

    private async performInsert(env: IOperationEnvelope) {
        if (env.serviceContactCreate === undefined) {
            return;
        }
        this._logUtil.incrementApiCallsMetric();
        const contactApiResult = await this._svcClient.createContact(env.serviceContactCreate);
        this._logUtil.logOutgoingApiResultForUser(env, contactApiResult);

        if(contactApiResult.success && (contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Count === 1) {
            env.serviceContact = _.first((contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Data);
        } else {
            env.serviceContact = undefined;
        }
    }

    private async performUpdate(env: IOperationEnvelope) {
        if (env.serviceContact &&
            env.serviceContactCreate &&
            (env.serviceContact.Name !== env.serviceContactCreate.Name ||
             env.serviceContact.IsExcludedFromCampaigns !== env.serviceContactCreate.IsExcludedFromCampaigns)) {
            this._logUtil.incrementApiCallsMetric();
            const contactApiResult = await this._svcClient.updateContact(env.serviceContactCreate.Email, 
                _.pick(env.serviceContactCreate, ["IsExcludedFromCampaigns", "Name"]));
            this._logUtil.logOutgoingApiResultForUser(env, contactApiResult);
            if (contactApiResult.success && (contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Count === 1) {
                env.serviceContact = _.first((contactApiResult.data as IMailjetPagedResult<IMailjetContact>).Data);
            } else {
                env.serviceContact = undefined;
            }
        }
    }

    private async performUpdateContactData(env: IOperationEnvelope) {
        if (env.serviceContactData && env.serviceContactData.Data.length !== 0 && env.serviceContact !== undefined) 
        {
            this._logUtil.incrementApiCallsMetric();
            const contactDataApiResult = await this._svcClient.updateContactData(env.serviceContact.ID, env.serviceContactData);
            this._logUtil.logOutgoingApiResultForUser(env, contactDataApiResult);
            if (contactDataApiResult.success) {
                env.serviceContactData = _.first((contactDataApiResult.data as IMailjetPagedResult<IMailjetContactData>).Data);
            } else {
                env.serviceContactData = undefined;
            }
        }
    }

    private async performUpdateListSubscriptions(env: IOperationEnvelope) {
        if (env.serviceContactListActions && env.serviceContactListActions.ContactsLists.length !== 0 && env.serviceContact !== undefined) 
        {
            this._logUtil.incrementApiCallsMetric();
            const contactListSubscriptionsApiResult = await this._svcClient.manageContactListSubscriptions(env.serviceContact.ID, env.serviceContactListActions);
            this._logUtil.logOutgoingApiResultForUser(env, contactListSubscriptionsApiResult);
            if (contactListSubscriptionsApiResult.success) {
                env.serviceContactListActions = { ContactsLists: (contactListSubscriptionsApiResult.data as IMailjetPagedResult<IMailjetContactListAction>).Data };
            } else {
                env.serviceContactListActions = undefined;
            }
        }
    }

    private async performHullUpdate(env: IOperationEnvelope) {
        if (env.serviceContact !== undefined) {
            // Make sure we have the latest data for the contact; the full list is not returned by updateContactData
            this._logUtil.incrementApiCallsMetric();
            const contactDataApiResult = await this._svcClient.getContactData(env.serviceContact.ID);
            this._logUtil.logOutgoingApiResultForUser(env, contactDataApiResult);
            env.serviceContactData = contactDataApiResult.success ? _.first((contactDataApiResult.data as IMailjetPagedResult<IMailjetContactData>).Data) : undefined;
            // Get the latest list recipients for the contact
            this._logUtil.incrementApiCallsMetric();
            const listRecipientsApiResult = await this._svcClient.getListRecipients(env.serviceContact.ID);
            this._logUtil.logOutgoingApiResultForUser(env, listRecipientsApiResult);
            env.serviceContactRecipients = listRecipientsApiResult.success ? 
                (listRecipientsApiResult.data as IMailjetPagedResult<IMailjetListRecipient>).Data : undefined;
            
            // [STEP 4] Call the Hull client to update the user
            const userIdent = this._mappingUtil.mapMailjetContactToHullUserIdent(env.serviceContact, (env.msg as IHullUserUpdateMessage).user);
            const userAttribs = this._mappingUtil.mapMailjetObjectsToHullUserAttributes(env.serviceContact, env.serviceContactData, env.serviceContactRecipients);

            await this._hullClient.asUser(userIdent)
                      .traits(userAttribs);
        }
    }
}

export default OutgoingUserHandler;