import nock from "nock";
import _ from "lodash";

import IMailjetClientConfig from "../../src/core/mailjet-client-config";
import IApiResultObject from "../../src/types/api-result";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IMailjetContact, IMailjetContactCreate } from "../../src/core/mailjet-objects";
import MailjetClient from "../../src/core/mailjet-client";

import ApiresponseV3Contactmetadata from "../data/apiresponse_v3_contactmetadata.json";
import ApiresponseV3Contactslist from "../data/apiresponse_v3_contactslist.json";
import ApiresponseV3ContactById from "../data/apiresponse_v3_contactbyid.json";
import ApiresponseV3Contact from "../data/apiresponse_v3_contact.json";
import ApiresponseV3ContactPost from "../data/apiresponse_v3_postcontact.json";
import ApiresponseV3ContactPostDuplicate from "../data/apiresponse_v3_postcontact_duplicate.json";
import ApiresponseV3Status404 from "../data/apiresponse_v3_status404.json";

const AUTH_HEADER = "Basic YXBpMTIzNDpzZWNyZXQ1Njc4OQ==";
const BASE_URL = 'https://api.mailjet.com';

describe("MailjetClient", () => {
    beforeEach(() => {
        nock.cleanAll();
        nock.restore();

        if (!nock.isActive()) {
            nock.activate()
        }
    });

    afterAll(() => {
        nock.cleanAll();
        nock.restore();
    });

    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test("should query metadata for contact properties (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 99;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contactmetadata);
        const url = `${BASE_URL}/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getMetadataContactProperties(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should query metadata for contact properties (status 200) with defaults", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 1000;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contactmetadata);
        const url = `${BASE_URL}/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getMetadataContactProperties();
        expect(actual).toEqual(expected);

    });

    test("should query metadata for contact properties (status 429) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 99;
        const offset = 0;
        
        const url = `${BASE_URL}/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`)
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactProperty>, any> = {
            data: "",
            endpoint: url,
            method: "query",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 429"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getMetadataContactProperties(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should query metadata for contact properties (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 99;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contactslist);
        const url = `${BASE_URL}/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactList>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContactLists(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should query metadata for contact properties (status 200) with defaults", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 1000;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contactslist);
        const url = `${BASE_URL}/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactList>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContactLists();
        expect(actual).toEqual(expected);

    });

    test("should query metadata for contact properties (status 429) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 99;
        const offset = 0;
        
        const url = `${BASE_URL}/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`)
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactList>, any> = {
            data: "",
            endpoint: url,
            method: "query",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 429"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContactLists(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should get a contact by id or email (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactById);
        responseBody.Data[0].ID = contactId;
        const url = `${BASE_URL}/v3/REST/contact/${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact/${contactId}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContact(contactId);
        expect(actual).toEqual(expected);

    });

    test("should get a contact by id or email (status 429) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactById);
        responseBody.Data[0].ID = contactId;
        const url = `${BASE_URL}/v3/REST/contact/${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact/${contactId}`)
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
            data: "",
            endpoint: url,
            method: "query",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 429"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContact(contactId);
        expect(actual).toEqual(expected);

    });

    test("should get a contact by id or email (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/contact/${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact/${contactId}`)
            .reply(404, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 404",
                "Object not found"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContact(contactId);
        expect(actual).toEqual(expected);

    });

    test("should query contacts (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 99;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contact);
        const url = `${BASE_URL}/v3/REST/contact?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContacts(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should query contacts (status 200) with defaults", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 1000;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contact);
        const url = `${BASE_URL}/v3/REST/contact?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContacts();
        expect(actual).toEqual(expected);

    });

    test("should query contacts (status 429)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const limit = 99;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contact);
        const url = `${BASE_URL}/v3/REST/contact?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact?Limit=${limit}&Offset=${offset}`)
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, any> = {
            data: "",
            endpoint: url,
            method: "query",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 429"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContacts(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should create a contact (status 201)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactName = "Jimmy Carter";
        const contactEmail = "jimmy.carter@hull.io";
        const contactExcludedCampaigns = false;
        
        const record: IMailjetContactCreate = {
            Email: contactEmail,
            IsExcludedFromCampaigns: contactExcludedCampaigns,
            Name: contactName
        };

        const responseBody = _.cloneDeep(ApiresponseV3ContactPost);
        responseBody.Data[0].ID = contactId;
        responseBody.Data[0].Email = contactEmail;
        responseBody.Data[0].Name = contactName;
        responseBody.Data[0].IsExcludedFromCampaigns = contactExcludedCampaigns;
        const url = `${BASE_URL}/v3/REST/contact`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/contact`)            
            .reply(201, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate> = {
            data: responseBody,
            endpoint: url,
            method: "insert",
            record,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.createContact(record);
        expect(actual).toEqual(expected);

    });

    test("should create a contact (status 400) but not allow duplicate", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactName = "Jimmy Carter";
        const contactEmail = "jimmy.carter@hull.io";
        const contactExcludedCampaigns = false;
        
        const record: IMailjetContactCreate = {
            Email: contactEmail,
            IsExcludedFromCampaigns: contactExcludedCampaigns,
            Name: contactName
        };

        const responseBody = _.cloneDeep(ApiresponseV3ContactPostDuplicate);
        responseBody.ErrorMessage = `MJ18 A Contact resource with value \"${contactEmail}\" for Email already exists.`;
        const url = `${BASE_URL}/v3/REST/contact`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/contact`)            
            .reply(400, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate> = {
            data: responseBody,
            endpoint: url,
            method: "insert",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 400",
                `MJ18 A Contact resource with value \"${contactEmail}\" for Email already exists.`
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.createContact(record);
        expect(actual).toEqual(expected);

    });

    test("should create a contact (status 429) but not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactName = "Jimmy Carter";
        const contactEmail = "jimmy.carter@hull.io";
        const contactExcludedCampaigns = false;
        
        const record: IMailjetContactCreate = {
            Email: contactEmail,
            IsExcludedFromCampaigns: contactExcludedCampaigns,
            Name: contactName
        };

        const url = `${BASE_URL}/v3/REST/contact`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/contact`)            
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactCreate> = {
            data: "",
            endpoint: url,
            method: "insert",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 429"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.createContact(record);
        expect(actual).toEqual(expected);

    });
});