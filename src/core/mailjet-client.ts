import _ from "lodash";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import IApiResultObject from "../types/api-result";
import IMailjetClientConfig from "./mailjet-client-config";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IMailjetContact, IMailjetContactCreate, IMailjetContactUpdate, IMailjetContactData, IMailjetContactDataUpdate, IMailjetContactListMembership, IMailjetListRecipient, IMailjetContactListCrud, IMailjetContactListAction, IMailjetEventCallbackUrlCreate, IMailjetEventCallbackUrl } from "./mailjet-objects";

const API_BASE_URL = `https://api.mailjet.com/v3/REST`;

class MailjetClient {
    private _apiKey: string;
    private _apiSecretKey: string;
    private _apiBaseUrl: string;

    /**
     * Creates an instance of MailjetClient.
     * @param {IMailjetClientConfig} config The configuration for the Mailjet client.
     * @memberof MailjetClient
     */
    constructor(config: IMailjetClientConfig) {
        this._apiKey = config.apiKey;
        this._apiSecretKey = config.apiSecretKey; 
        this._apiBaseUrl = API_BASE_URL;
    }

    /**
     * Retrieve a specific contact. Includes information about contact status and creation / activity timestamps.
     * See https://dev.mailjet.com/email/reference/contacts/contact#v3_get_contact_contact_ID
     *
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async getContact(mjIdent: string | number): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, any>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}`;
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContact>, any>(url, method, axiosError);

            return apiResult;
        }

    }

    /**
     * Add a new unique contact to your global contact list and select its exclusion status.
     * See https://dev.mailjet.com/email/reference/contacts/contact#v3_post_contact
     *
     * @param {IMailjetContactCreate} record The record to create.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async createContact(record: IMailjetContactCreate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate>> {
        const url = `${this._apiBaseUrl}/contact`;
        const method = "insert";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.post(url, record, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate>(url, method, axiosError);

            return apiResult;
        }

    }

    /**
     * Update the user-given name and exclusion status of a specific contact.
     * See https://dev.mailjet.com/email/reference/contacts/contact/#v3_put_contact_contact_ID
     *
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {IMailjetContactUpdate} record The data to update.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async updateContact(mjIdent: string | number, record: IMailjetContactUpdate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}`;
        const method = "update";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.put(url, record, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate>(url, method, axiosError);

            return apiResult;
        }

    }

    /**
     * Retrieve a list of all contacts. Includes information about contact status and creation / activity timestamps.
     * See https://dev.mailjet.com/email/reference/contacts/contact#v3_get_contact
     *
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>>>} An API result with the paged contact.
     * @memberof MailjetClient
     */
    public async getContacts(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContact>, any>> {
        const url = `${this._apiBaseUrl}/contact?Limit=${limit}&Offset=${offset}`;
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContact>, any>(url, method, axiosError);

            return apiResult;
        }

    }

    /**
     * Retrieve all contact lists for a specific contact. You will receive information on the status of the contact for each list. 
     * Information about lists deleted within the last 60 days will be returned as well, since those are soft-deleted and can be reinstated.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_get_contact_contact_ID_getcontactslists
     *
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any>>} An API result with the paged list subscriptions.
     * @memberof MailjetClient
     */
    public async getContactListSubscriptions(mjIdent: string | number): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}/getcontactslists`;
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContactListMembership>, any>(url, method, axiosError);

            return apiResult;
        }
    }

    /**
     * Retrieve details on all list recipients for the given contact.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_get_listrecipient
     * 
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
        
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetListRecipient>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetListRecipient>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetListRecipient>, any>(url, method, axiosError);

            return apiResult;
        }
    }

    /**
     * Delete a list recipient. This effectively removes a contact from a contact list.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_delete_listrecipient_listrecipient_ID
     *
     * @param {number} recipientId The unique numeric ID of the list recipient.
     * @returns {Promise<IApiResultObject<any, any>>} An API result object with no content.
     * @memberof MailjetClient
     */
    public async deleteListRecipient(recipientId: number): Promise<IApiResultObject<any, any>> {
        const url = `${this._apiBaseUrl}/listrecipient/${recipientId}`;

        const method = "delete";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<any, any> = {
                data: { message: `Recipient with id '${recipientId} deleted.` },
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<any, any> = 
                this.createApiErrorResult<any, any>(url, method, axiosError);

            return apiResult;
        }
    }

    /**
     * Manage the presence and subscription status of a contact for multiple contact lists. 
     * Select the contact lists, as well as the desired action to be performed on each one - add, remove or unsub. 
     * The contact should already be present in the global contact list.
     * See https://dev.mailjet.com/email/reference/contacts/subscriptions/#v3_post_contact_contact_ID_managecontactslists
     *
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {IMailjetContactListCrud} actions Information about the contact lists and the actions performed for each list.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud>>} An API result object with a paged result of actions performed for each list.
     * @memberof MailjetClient
     */
    public async manageContactListSubscriptions(mjIdent: string | number, actions: IMailjetContactListCrud): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud>> {
        const url = `${this._apiBaseUrl}/contact/${mjIdent}/managecontactslists`;
        const method = "insert";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.post(url, actions, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: actions,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud>(url, method, axiosError);

            return apiResult;
        }
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
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactList>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactList>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContactList>, any>(url, method, axiosError);

            return apiResult;
        }
    } 

    /**
     * Retrieve all properties and respective values associated with a specific contact.
     * See https://dev.mailjet.com/email/reference/contacts/contact-properties/#v3_get_contactdata_contact_ID
     *
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>>>} An API result with the paged contact data.
     * @memberof MailjetClient
     */
    public async getContactData(mjIdent: string | number): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>, any>> {
        const url = `${this._apiBaseUrl}/contactdata/${mjIdent}`;
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContactData>, any>(url, method, axiosError);

            return apiResult;
        }

    }

    /**
     * Update the extra static data for a contact by using your already created /contactmetadata objects (contact properties) and 
     * assigning / updating values to them for the specific ContactID.
     * See https://dev.mailjet.com/email/reference/contacts/contact-properties/#v3_put_contactdata_contact_ID
     *
     * @param {(string | number)} mjIdent The Mailjet ID or email address of the contact.
     * @param {IMailjetContactDataUpdate} record The data to update.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate>>} An API result with the paged contact data.
     * @memberof MailjetClient
     */
    public async updateContactData(mjIdent: string | number, record: IMailjetContactDataUpdate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate>> {
        const url = `${this._apiBaseUrl}/contactdata/${mjIdent}`;
        const method = "update";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.put(url, record, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate>(url, method, axiosError);

            return apiResult;
        }

    }

    /**
     * Returns the metadata for all contact properties in the authenticated Mailjet account.
     * See https://dev.mailjet.com/email/reference/contacts/contact-properties/
     *
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>>>} An API result with the paged contact properties list.
     * @memberof MailjetClient
     */
    public async getMetadataContactProperties(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any>> {
        const url = `${this._apiBaseUrl}/contactmetadata?Limit=${limit}&Offset=${offset}`;
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetContactProperty>, any>(url, method, axiosError);

            return apiResult;
        }
    }

    /**
     * Add a new callback URL used as a webhook to track different email actions.
     * see https://dev.mailjet.com/email/reference/webhook/#v3_post_eventcallbackurl
     *
     * @param {IMailjetEventCallbackUrlCreate} record The information about the callback URL.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate>>} An API result with the paged callback URLs.
     * @memberof MailjetClient
     */
    public async createEventCallback(record: IMailjetEventCallbackUrlCreate): Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate>> {
        const url = `${this._apiBaseUrl}/eventcallbackurl`;
        const method = "insert";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.post(url, record, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate>(url, method, axiosError);

            return apiResult;
        }
    }

    /**
     * Delete an existing callback URL.
     * see https://dev.mailjet.com/email/reference/webhook/#v3_delete_eventcallbackurl_url_ID
     *
     * @param {number} mjIdent The unique numeric ID for the callback URL you want to delete.
     * @returns {Promise<IApiResultObject<boolean, number>>} An API result indicating the deletion result.
     * @memberof MailjetClient
     */
    public async deleteEventCallback(mjIdent: number): Promise<IApiResultObject<boolean, number>> {
        const url = `${this._apiBaseUrl}/eventcallbackurl/${mjIdent}`;
        const method = "delete";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.delete(url, axiosConfig);
        
            const apiResult: IApiResultObject<boolean, number> = {
                data: true,
                endpoint: url,
                error: undefined,
                method,
                record: mjIdent,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<boolean, number> = 
                this.createApiErrorResult<boolean, number>(url, method, axiosError);

            return apiResult;
        }
    }

    /**
     * Retrieve a list of all callback URL objects and their configuration settings.
     * see https://dev.mailjet.com/email/reference/webhook/#v3_get_eventcallbackurl
     *
     * @param {number} [offset=0] The list offset for pagination, defaults to zero.
     * @param {number} [limit=1000] The page size for pagination, defaults to 1000.
     * @returns {Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any>>} An API result with the paged callback URLs.
     * @memberof MailjetClient
     */
    public async listEventCallbacks(offset: number = 0, limit: number = 1000): Promise<IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any>> {
        const url = `${this._apiBaseUrl}/eventcallbackurl?Limit=${limit}&Offset=${offset}`;
        const method = "query";

        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any> = 
                this.createApiErrorResult<IMailjetPagedResult<IMailjetEventCallbackUrl>, any>(url, method, axiosError);

            return apiResult;
        }
    }

    private createApiErrorResult<T, U>(url: string, method: "query" | "insert" | "update" | "delete", error: AxiosError, record?: T): IApiResultObject<T, U> {
        const axiosResponse = error.response;

        const apiResult: IApiResultObject<T, U> = {
            data: undefined,
            endpoint: url,
            error: error.message,
            method,
            record,
            success: false
        };

        if (axiosResponse !== undefined) {
            apiResult.data = axiosResponse.data;
            apiResult.error = _.filter([ 
                error.message, 
                axiosResponse.statusText,
                _.get(axiosResponse, "data.ErrorMessage", undefined) 
            ], (val) => { 
                return !_.isNil(val);
            });
        }

        return apiResult;
    }

    private createAxiosRequestConfig(): AxiosRequestConfig {
        return {
            auth: {
                username: this._apiKey,
                password: this._apiSecretKey
            },
            responseType: "json"
        };
    }
}

export default MailjetClient;