import nock from "nock";
import _ from "lodash";

import IMailjetClientConfig from "../../src/core/mailjet-client-config";
import IApiResultObject from "../../src/types/api-result";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList, IMailjetContact, IMailjetContactCreate, IMailjetContactUpdate, IMailjetContactDataUpdate, IMailjetContactData, IMailjetContactListMembership, IMailjetContactListCrud, IMailjetContactListAction, IMailjetEventCallbackUrlCreate, IMailjetEventCallbackUrl } from "../../src/core/mailjet-objects";
import MailjetClient from "../../src/core/mailjet-client";

import ApiresponseV3Contactmetadata from "../data/apiresponse_v3_contactmetadata.json";
import ApiresponseV3Contactslist from "../data/apiresponse_v3_contactslist.json";
import ApiresponseV3ContactById from "../data/apiresponse_v3_contactbyid.json";
import ApiresponseV3Contact from "../data/apiresponse_v3_contact.json";
import ApiresponseV3ContactPost from "../data/apiresponse_v3_postcontact.json";
import ApiresponseV3ContactPostDuplicate from "../data/apiresponse_v3_postcontact_duplicate.json";
import ApiresponseV3ContactPut from "../data/apiresponse_v3_putcontact.json";
import ApiresponseV3ContactDataById from "../data/apiresponse_v3_contactdatabyid.json";
import ApiresponseV3ContactDataByIdInvalidKey from "../data/apiresponse_v3_contactdatabyid_invalidkey.json";
import ApiresponseV3ContactGetListSubscriptions from "../data/apiresponse_v3_contact_getcontactlists.json";
import ApiresponseV3ContactGetSubscriberIds from "../data/apiresponse_v3_listrecipient.json";
import ApiresponseV3ContactManageContactLists from "../data/apiresponse_v3_managecontactslists.json";
import ApiresponseV3EventCallbackUrlPost from "../data/apiresponse_v3_posteventcallbackurl.json";
import ApiresponseV3EventCallbackUrl from "../data/apiresponse_v3_eventcallbackurl.json";
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

    test("should query metadata for contact lists (status 200)", async () => {
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

    test("should query metadata for contact lists (status 200) with defaults", async () => {
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

    test("should query metadata for contact lists (status 429) and not throw", async () => {
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

    test("should update a contact (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactName = "Jimmy Carter II";
        const contactEmail = "jimmy.carter@hull.io";
        const contactExcludedCampaigns = true;
        
        const record: IMailjetContactUpdate = {
            IsExcludedFromCampaigns: contactExcludedCampaigns,
            Name: contactName
        };

        const responseBody = _.cloneDeep(ApiresponseV3ContactPut);
        responseBody.Data[0].ID = contactId;
        responseBody.Data[0].Email = contactEmail;
        responseBody.Data[0].Name = contactName;
        responseBody.Data[0].IsExcludedFromCampaigns = contactExcludedCampaigns;
        const url = `${BASE_URL}/v3/REST/contact/${contactEmail}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .put(`/v3/REST/contact/${contactEmail}`)            
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate> = {
            data: responseBody,
            endpoint: url,
            method: "update",
            record,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.updateContact(contactEmail, record);
        expect(actual).toEqual(expected);

    });

    test("should not update a non-existant contact (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactName = "Baz Foo Bar";
        const contactEmail = "baz.foo@hull.io";
        const contactExcludedCampaigns = true;
        
        const record: IMailjetContactUpdate = {
            IsExcludedFromCampaigns: contactExcludedCampaigns,
            Name: contactName
        };

        const responseBody = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/contact/${contactEmail}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .put(`/v3/REST/contact/${contactEmail}`)            
            .reply(404, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContact>, IMailjetContactUpdate> = {
            data: responseBody,
            endpoint: url,
            method: "update",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 404",
                "Object not found"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.updateContact(contactEmail, record);
        expect(actual).toEqual(expected);

    });

    test("should get contact data by id or email (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactDataById);
        responseBody.Data[0].ID = contactId;
        responseBody.Data[0].ContactID = contactId;
        const url = `${BASE_URL}/v3/REST/contactdata/${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactdata/${contactId}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContactData(contactId);
        expect(actual).toEqual(expected);

    });

    test("should get contact data by id or email (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/contactdata/${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactdata/${contactId}`)
            .reply(404, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, any> = {
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
        const actual = await client.getContactData(contactId);
        expect(actual).toEqual(expected);

    });

    test("should update contact data (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactEmail = "jimmy.carter@hull.io";
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactDataById);

        const record: IMailjetContactDataUpdate = {
            Data: responseBody.Data[0].Data
        };

        record.Data.push({
            Name: "salutation",
            Value: "Mr."
        });
        
        responseBody.Data[0].ID = contactId;
        responseBody.Data[0].ContactID = contactId;
        responseBody.Data[0].Data = record.Data as any[];
        const url = `${BASE_URL}/v3/REST/contactdata/${contactEmail}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .put(`/v3/REST/contactdata/${contactEmail}`)            
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate> = {
            data: responseBody,
            endpoint: url,
            method: "update",
            record,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.updateContactData(contactEmail, record);
        expect(actual).toEqual(expected);

    });

    test("should not update data of a non-existant contact (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 9863585260;
        const contactEmail = "bar.foobaz@hull.io";
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactDataById);

        const record: IMailjetContactDataUpdate = {
            Data: responseBody.Data[0].Data
        };

        record.Data.push({
            Name: "salutation",
            Value: "Mr."
        });
        
        const apiResponse404 = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/contactdata/${contactEmail}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .put(`/v3/REST/contactdata/${contactEmail}`)            
            .reply(404, apiResponse404);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate> = {
            data: apiResponse404,
            endpoint: url,
            method: "update",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 404",
                "Object not found"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.updateContactData(contactEmail, record);
        expect(actual).toEqual(expected);

    });

    test("should not update data with an invalid key for existing contact (status 400) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactEmail = "jimmy.carter@hull.io";
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactDataById);

        const record: IMailjetContactDataUpdate = {
            Data: responseBody.Data[0].Data
        };

        record.Data.push({
            Name: "foo",
            Value: "bar"
        });
        
        const apiResponse400 = _.cloneDeep(ApiresponseV3ContactDataByIdInvalidKey);
        const url = `${BASE_URL}/v3/REST/contactdata/${contactEmail}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .put(`/v3/REST/contactdata/${contactEmail}`)            
            .reply(400, apiResponse400);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactData>, IMailjetContactDataUpdate> = {
            data: apiResponse400,
            endpoint: url,
            method: "update",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 400",
                "Invalid key name: \"foo\""
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.updateContactData(contactEmail, record);
        expect(actual).toEqual(expected);

    });

    test("should get contact list subscriptions by id or email (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactGetListSubscriptions);
        const url = `${BASE_URL}/v3/REST/contact/${contactId}/getcontactslists`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact/${contactId}/getcontactslists`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getContactListSubscriptions(contactId);
        expect(actual).toEqual(expected);

    });

    test("should get contact list subscriptions by id or email (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        
        const responseBody = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/contact/${contactId}/getcontactslists`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contact/${contactId}/getcontactslists`)
            .reply(404, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
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
        const actual = await client.getContactListSubscriptions(contactId);
        expect(actual).toEqual(expected);

    });

    test("should get contact list subscriber ids by id (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const limit = 99;
        const offset = 0;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactGetSubscriberIds);
        responseBody.Data[0].ContactID = contactId;
        const url = `${BASE_URL}/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&Contact=${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&Contact=${contactId}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getListRecipients(contactId, offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should get contact list subscriber ids by email (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const contactEmail = "john.doe@hull.io";
        const limit = 99;
        const offset = 0;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactGetSubscriberIds);
        responseBody.Data[0].ContactID = contactId;
        const url = `${BASE_URL}/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&ContactEmail=${contactEmail}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&ContactEmail=${contactEmail}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getListRecipients(contactEmail, offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should get contact list subscriber ids by id or email (status 200) with defaults", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const limit = 1000;
        const offset = 0;
        
        const responseBody = _.cloneDeep(ApiresponseV3ContactGetSubscriberIds);
        responseBody.Data[0].ContactID = contactId;
        const url = `${BASE_URL}/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&Contact=${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&Contact=${contactId}`)
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.getListRecipients(contactId);
        expect(actual).toEqual(expected);

    });

    test("should get contact list subscriber ids by id or email (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 673765787097;
        const limit = 99;
        const offset = 0;
        
        const responseBody = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&Contact=${contactId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/listrecipient?Limit=${limit}&Offset=${offset}&Contact=${contactId}`)
            .reply(404, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
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
        const actual = await client.getListRecipients(contactId, offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should delete a list recipient (status 204)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const recipientId = 5678;

        const url = `${BASE_URL}/v3/REST/listrecipient/${recipientId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/listrecipient/${recipientId}`)
            .reply(204);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
            data: { message: `Recipient with id '${recipientId} deleted.`},
            endpoint: url,
            method: "delete",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.deleteListRecipient(recipientId);
        expect(actual).toEqual(expected);

    });

    test("should delete a list recipient (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const recipientId = 673765787097;
        
        const responseBody = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/listrecipient/${recipientId}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/listrecipient/${recipientId}`)
            .reply(404, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListMembership>, any> = {
            data: responseBody,
            endpoint: url,
            method: "delete",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 404",
                "Object not found"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.deleteListRecipient(recipientId);
        expect(actual).toEqual(expected);

    });

    test("should manage list subscriptions (status 201)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 1234;
        const apiResponse = _.cloneDeep(ApiresponseV3ContactManageContactLists);
        const url = `${BASE_URL}/v3/REST/contact/${contactId}/managecontactslists`;
        const actions: IMailjetContactListCrud = {
            ContactsLists: [
                {
                    "Action": "addnoforce",
                    "ListID": 1115
                },
                {
                    "Action": "unsub",
                    "ListID": 2818
                }
            ]
        };
        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/contact/${contactId}/managecontactslists`)
            .reply(201, apiResponse);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud> = {
            data: apiResponse,
            endpoint: url,
            method: "insert",
            record: actions,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.manageContactListSubscriptions(contactId, actions);
        expect(actual).toEqual(expected);

    });

    test("should manage list subscriptions (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const contactId = 63874888;
        const apiResponse = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/contact/${contactId}/managecontactslists`;
        const actions: IMailjetContactListCrud = {
            ContactsLists: [
                {
                    "Action": "addnoforce",
                    "ListID": 1115
                },
                {
                    "Action": "unsub",
                    "ListID": 2818
                }
            ]
        };
        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/contact/${contactId}/managecontactslists`)
            .reply(404, apiResponse);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetContactListAction>, IMailjetContactListCrud> = {
            data: apiResponse,
            endpoint: url,
            method: "insert",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 404",
                "Object not found"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.manageContactListSubscriptions(contactId, actions);
        expect(actual).toEqual(expected);

    });

    test("should create an eventcallbackurl (status 201)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };
        
        const record: IMailjetEventCallbackUrlCreate = {
            EventType: "open",
            IsBackup: false,
            Status: "alive",
            Url: "https://1234:56789@mailjet.hullapp.net/eventcallback?org=foo.hullapp.io"
        };

        const responseBody = _.cloneDeep(ApiresponseV3EventCallbackUrlPost);
        responseBody.Data[0].EventType = record.EventType;
        responseBody.Data[0].IsBackup = record.IsBackup;
        responseBody.Data[0].Status = record.Status;
        responseBody.Data[0].Url = record.Url;
        const url = `${BASE_URL}/v3/REST/eventcallbackurl`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/eventcallbackurl`)            
            .reply(201, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate> = {
            data: responseBody,
            endpoint: url,
            method: "insert",
            record,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.createEventCallback(record);
        expect(actual).toEqual(expected);

    });

    test("should create an eventcallbackurl (status 429) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };
        
        const record: IMailjetEventCallbackUrlCreate = {
            EventType: "open",
            IsBackup: false,
            Status: "alive",
            Url: "https://1234:56789@mailjet.hullapp.net/eventcallback?org=foo.hullapp.io"
        };

        const url = `${BASE_URL}/v3/REST/eventcallbackurl`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .post(`/v3/REST/eventcallbackurl`)            
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, IMailjetEventCallbackUrlCreate> = {
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
        const actual = await client.createEventCallback(record);
        expect(actual).toEqual(expected);

    });

    test("should delete an eventcallbackurl (status 204)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };
        
        const mjIdent = 1234;
        const url = `${BASE_URL}/v3/REST/eventcallbackurl/${mjIdent}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .delete(`/v3/REST/eventcallbackurl/${mjIdent}`)            
            .reply(204);

        const expected: IApiResultObject<boolean, number> = {
            data: true,
            endpoint: url,
            method: "delete",
            record: mjIdent,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.deleteEventCallback(mjIdent);
        expect(actual).toEqual(expected);

    });

    test("should delete an eventcallbackurl (status 404) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };
        
        const mjIdent = 1234;
        const apiResponse = _.cloneDeep(ApiresponseV3Status404);
        const url = `${BASE_URL}/v3/REST/eventcallbackurl/${mjIdent}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .delete(`/v3/REST/eventcallbackurl/${mjIdent}`)            
            .reply(404, apiResponse);

        const expected: IApiResultObject<boolean, number> = {
            data: apiResponse,
            endpoint: url,
            method: "delete",
            record: undefined,
            success: false,
            error: [
                "Request failed with status code 404",
                "Object not found"
            ]
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.deleteEventCallback(mjIdent);
        expect(actual).toEqual(expected);

    });

    test("should get the list of eventcallbackurls (status 200)", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const offset = 10;
        const limit = 99;
        const responseBody = _.cloneDeep(ApiresponseV3EventCallbackUrl);
        const url = `${BASE_URL}/v3/REST/eventcallbackurl?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/eventcallbackurl?Limit=${limit}&Offset=${offset}`)            
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.listEventCallbacks(offset, limit);
        expect(actual).toEqual(expected);

    });

    test("should get the list of eventcallbackurls (status 200) with defaults", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const offset = 0;
        const limit = 1000;
        const responseBody = _.cloneDeep(ApiresponseV3EventCallbackUrl);
        const url = `${BASE_URL}/v3/REST/eventcallbackurl?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/eventcallbackurl?Limit=${limit}&Offset=${offset}`)            
            .reply(200, responseBody);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any> = {
            data: responseBody,
            endpoint: url,
            method: "query",
            record: undefined,
            success: true
        };

        const client = new MailjetClient(mjClientConfig);
        const actual = await client.listEventCallbacks();
        expect(actual).toEqual(expected);

    });

    test("should get the list of eventcallbackurls (status 429) and not throw", async () => {
        const mjClientConfig: IMailjetClientConfig = {
            apiKey: "api1234",
            apiSecretKey: "secret56789"
        };

        const offset = 10;
        const limit = 99;
        const url = `${BASE_URL}/v3/REST/eventcallbackurl?Limit=${limit}&Offset=${offset}`;

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/eventcallbackurl?Limit=${limit}&Offset=${offset}`)            
            .reply(429);

        const expected: IApiResultObject<IMailjetPagedResult<IMailjetEventCallbackUrl>, any> = {
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
        const actual = await client.listEventCallbacks(offset, limit);
        expect(actual).toEqual(expected);

    });
});