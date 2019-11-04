import _ from "lodash";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import IApiResultObject from "../types/api-result";
import IMailjetClientConfig from "./mailjet-client-config";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IMailjetContact, IMailjetContactCreate } from "./mailjet-objects";

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