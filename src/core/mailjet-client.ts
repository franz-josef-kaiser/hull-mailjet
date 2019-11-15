import _ from "lodash";
import IApiResultObject, { IApiResultGenericBodyWithMessage } from "../types/api-result";
import IMailjetClientConfig from "./mailjet-client-config";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IMailjetContact, IMailjetContactCreate, IMailjetContactUpdate, IMailjetContactData, IMailjetContactDataUpdate, IMailjetContactListMembership, IMailjetListRecipient, IMailjetContactListCrud, IMailjetContactListAction, IMailjetEventCallbackUrlCreate, IMailjetEventCallbackUrl } from "./mailjet-objects";
import GenericClient from "./mailjet-client/generic-client";
import { API_BASE_URL } from "./constants";

class MailjetClient {
    private _apiBaseUrl: string;
    private _axiosClient: GenericClient;

    /**
     * Creates an instance of MailjetClient.
     * @param {IMailjetClientConfig} config The configuration for the Mailjet client.
     * @memberof MailjetClient
     */
    constructor(config: IMailjetClientConfig) {
        this._apiBaseUrl = API_BASE_URL;
        this._axiosClient = new GenericClient({
            username: config.apiKey,
            password: config.apiSecretKey
        });
    }

    /**
     * Retrieve a specific contact. Includes information about contact status and creation / activity timestamps.
     * See https://dev.mailjet.com/email/reference/contacts/contact#v3_get_contact_contact_ID
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async getContact(mjIdent: string | number): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, any>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetContact>, any>(url);
        return result;
    }

    /**
     * Add a new unique contact to your global contact list and select its exclusion status.
     * See https://dev.mailjet.com/email/reference/contacts/contact#v3_post_contact
     * @param {IMailjetContactCreate} record The record to create.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async createContact(record: IMailjetContactCreate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate>> {
        const url = `${this._apiBaseUrl}/contact`;
        const result = await this._axiosClient.executeInsert<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate>(url, record);
        return result;
    }

    /**
     * Update the user-given name and exclusion status of a specific contact.
     * See https://dev.mailjet.com/email/reference/contacts/contact/#v3_put_contact_contact_ID
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {IMailjetContactUpdate} record The data to update.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async updateContact(mjIdent: string | number, record: IMailjetContactUpdate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}`;
        const result = await this._axiosClient.executeUpdate<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate>(url, record);
        return result;
    }

    /**
     * Retrieve a list of all contacts. Includes information about contact status and creation / activity timestamps.
     * See https://dev.mailjet.com/email/reference/contacts/contact#v3_get_contact
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async getContacts(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, any>> {
        const url = `${this._apiBaseUrl}/contact?Limit=${limit}&Offset=${offset}`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetContact>, any>(url);
        return result;
    }

    /**
     * Retrieve all contact lists for a specific contact.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_get_contact_contact_ID_getcontactslists
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any>>} An API result with the paged list subscriptions.
     * @memberof MailjetClient
     */
    public async getContactListSubscriptions(mjIdent: string | number): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}/getcontactslists`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetContactListMembership>, any>(url);
        return result;
    }

    /**
     * Retrieve details on all list recipients for the given contact.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_get_listrecipient 
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetListRecipient>, any>>} An API result with the paged list recipients.
     * @memberof MailjetClient
     */
    public async getListRecipients(mjIdent: string | number, offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetListRecipient>, any>> {
        let url = `${this._apiBaseUrl}/listrecipient?Limit=${limit}&Offset=${offset}`;
        if(_.isNumber(mjIdent)) {
            url += `&Contact=${mjIdent}`;
        } else {
            url += `&ContactEmail=${mjIdent}`;
        }
        
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetListRecipient>, any>(url);
        return result;
    }

    /**
     * Delete a list recipient. This effectively removes a contact from a contact list.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_delete_listrecipient_listrecipient_ID
     * @param {number} recipientId The unique numeric ID of the list recipient.
     * @returns {Promise<IApiResultObject<any, any>>} An API result object with no content.
     * @memberof MailjetClient
     */
    public async deleteListRecipient(recipientId: number): Promise<IApiResultObject<IApiResultGenericBodyWithMessage, any>> {
        const url = `${this._apiBaseUrl}/listrecipient/${recipientId}`;
        const result = await this._axiosClient.executeDelete<IApiResultGenericBodyWithMessage, any>(url, undefined, { message: `Recipient with id '${recipientId} deleted.`});
        return result;
    }

    /**
     * Manage the presence and subscription status of a contact for multiple contact lists.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_post_contact_contact_ID_managecontactslists
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {IMailjetContactListCrud} actions Information about the contact lists and the actions performed for each list.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud>>} An API result object with a paged result of actions performed for each list.
     * @memberof MailjetClient
     */
    public async manageContactListSubscriptions(mjIdent: string | number, actions: IMailjetContactListCrud): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}/managecontactslists`;
        const result = await this._axiosClient.executeInsert<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud>(url, actions);
        return result;
    }

    /**
     * Retrieve details for all contact lists - name, subscriber count, creation timestamp, deletion status.
     * See https://dev.mailjet.com/email/reference/contacts/contact-list/
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactList>>>} An API result with the paged contacts lists.
     * @memberof MailjetClient
     */
    public async getContactLists(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactList>, any>> {
        const url = `${this._apiBaseUrl}/contactslist?Limit=${limit}&Offset=${offset}`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetContactList>, any>(url);
        return result;
    } 

    /**
     * Retrieve all properties and respective values associated with a specific contact.
     * See https://dev.mailjet.com/email/reference/contacts/contact-properties/#v3_get_contactdata_contact_ID
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>>>} An API result with the paged contact data.
     * @memberof MailjetClient
     */
    public async getContactData(mjIdent: string | number): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>, any>> {
        const url = `${this._apiBaseUrl}/contactdata/${mjIdent}`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetContactData>, any>(url);
        return result;
    }

    /**
     * Update the extra static data for a contact by using your already created /contactmetadata objects (contact properties) and 
     * assigning / updating values to them for the specific ContactID.
     * See https://dev.mailjet.com/email/reference/contacts/contact-properties/#v3_put_contactdata_contact_ID
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {IMailjetContactDataUpdate} record The data to update.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate>>} An API result with the paged contact data.
     * @memberof MailjetClient
     */
    public async updateContactData(mjIdent: string | number, record: IMailjetContactDataUpdate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate>> {
        const url = `${this._apiBaseUrl}/contactdata/${mjIdent}`;
        const result = await this._axiosClient.executeUpdate<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate>(url, record);
        return result;
    }

    /**
     * Returns the metadata for all contact properties in the authenticated Mailjet account.
     * See https://dev.mailjet.com/email/reference/contacts/contact-properties/
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>>>} An API result with the paged contact properties list.
     * @memberof MailjetClient
     */
    public async getMetadataContactProperties(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any>> {
        const url = `${this._apiBaseUrl}/contactmetadata?Limit=${limit}&Offset=${offset}`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetContactProperty>, any>(url);
        return result;
    }

    /**
     * Add a new callback URL used as a webhook to track different email actions.
     * see https://dev.mailjet.com/email/reference/webhook/#v3_post_eventcallbackurl
     * @param {IMailjetEventCallbackUrlCreate} record The information about the callback URL.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate>>} An API result with the paged callback URLs.
     * @memberof MailjetClient
     */
    public async createEventCallback(record: IMailjetEventCallbackUrlCreate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate>> {
        const url = `${this._apiBaseUrl}/eventcallbackurl`;
        const result = await this._axiosClient.executeInsert<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate>(url, record);
        return result;
    }

    /**
     * Delete an existing callback URL.
     * see https://dev.mailjet.com/email/reference/webhook/#v3_delete_eventcallbackurl_url_ID
     * @param {number} mjIdent The unique numeric ID for the callback URL you want to delete.
     * @returns {Promise<IApiResultObject<boolean, number>>} An API result indicating the deletion result.
     * @memberof MailjetClient
     */
    public async deleteEventCallback(mjIdent: number): Promise<IApiResultObject<boolean, number>> {
        const url = `${this._apiBaseUrl}/eventcallbackurl/${mjIdent}`;
        const result = await this._axiosClient.executeDelete<boolean, number>(url, mjIdent, true);
        return result;
    }

    /**
     * Retrieve a list of all callback URL objects and their configuration settings.
     * see https://dev.mailjet.com/email/reference/webhook/#v3_get_eventcallbackurl
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any>>} An API result with the paged callback URLs.
     * @memberof MailjetClient
     */
    public async listEventCallbacks(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any>> {
        const url = `${this._apiBaseUrl}/eventcallbackurl?Limit=${limit}&Offset=${offset}`;
        const result = this._axiosClient.executeQuery<IMailjetPagedResult<IMailjetEventCallbackUrl>, any>(url);
        return result;
    }
}

export default MailjetClient;