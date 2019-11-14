import { ContextMock } from "../_helpers/mocks";
import nock from "nock";
import _ from "lodash";
import SyncAgent from "../../src/core/sync-agent";
import IPrivateSettings from "../../src/types/private-settings";

import ApiresponseV3Contactmetadata from "../data/apiresponse_v3_contactmetadata.json";
import ApiresponseV3Contactslist from "../data/apiresponse_v3_contactslist.json";
import { IApiResponseNocked } from "../_helpers/types";
import { IMailjetEvent } from "../../src/core/mailjet-objects";
import { MJ_EVENT_ID, MJ_EVENT_GUID, MJ_IDENT1_EMAIL, MJ_EVENT_CAMPAIGNID, MJ_IDENT1_ID, MJ_EVENT_TIME } from "../_helpers/constants";

const AUTH_HEADER = "Basic YXBpMTIzNDpzZWNyZXQ1Njc4OQ==";
const BASE_URL = 'https://api.mailjet.com';

describe("SyncAgent", () => {
    let ctxMock: ContextMock;

    beforeEach(() => {
        ctxMock = new ContextMock("1234", {}, {
            contact_attributes_outbound: [],
            contact_synchronized_segments: []
        });
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

    test('should detect if authentication is not configured', () => {
        const agent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);
        const actual = agent.isAuthNConfigured();
        expect(actual).toBeFalsy();
    });

    test('should detect if authentication is configured', () => {
        (ctxMock.connector.private_settings as IPrivateSettings) = {
            api_key: "api1234",
            api_secret_key: "secret56789",
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "Test"
        };
        const agent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);
        const actual = agent.isAuthNConfigured();
        expect(actual).toBeTruthy();
    });

    test('should return a list of custom properties', async () => {
        (ctxMock.connector.private_settings as IPrivateSettings) = {
            api_key: "api1234",
            api_secret_key: "secret56789",
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "Test"
        };
        const agent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const limit = 100;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contactmetadata);

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactmetadata?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);
        
        const actual = await agent.getMetadataContactProperties();
        const expected = responseBody.Data;
        expect(actual).toEqual(expected);
        expect(ctxMock.metric.increment.mock.calls).toHaveLength(1);
        expect(ctxMock.metric.increment.mock.calls[0]).toEqual([ "ship.service_api.call", 1 ]);
    });

    test('should return a list of contact lists', async () => {
        (ctxMock.connector.private_settings as IPrivateSettings) = {
            api_key: "api1234",
            api_secret_key: "secret56789",
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "Test"
        };
        const agent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const limit = 100;
        const offset = 0;
        const responseBody = _.cloneDeep(ApiresponseV3Contactslist);

        nock(`${BASE_URL}`)
            .matchHeader('Authorization', AUTH_HEADER)
            .get(`/v3/REST/contactslist?Limit=${limit}&Offset=${offset}`)
            .reply(200, responseBody);
        
        const actual = await agent.getContactLists();
        const expected = responseBody.Data;
        expect(actual).toEqual(expected);
        expect(ctxMock.metric.increment.mock.calls).toHaveLength(1);
        expect(ctxMock.metric.increment.mock.calls[0]).toEqual([ "ship.service_api.call", 1 ]);
    });

    const scenariosToTest: string[] = [
        "create_contact",
        "update_contact",
        "update_contactdata",
        "update_subscriptions",
        "skip_noemail",
        "skip_noauthn",
        "update_contactdata_failgetcontactdata",
        "update_subscriptions_failgetrecipients",
    ];

    _.forEach(scenariosToTest, (scenarioName) => {
        test(`should handle scenario '${scenarioName}'`, async() => {
            const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
            const smartNotifierPayload = payloadSetupFn();

            ctxMock.connector = smartNotifierPayload.connector;
            ctxMock.ship = smartNotifierPayload.connector;

            const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

            const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
            const apiResponses = apiResponseSetupFn(nock);

            await syncAgent.sendUserMessages(smartNotifierPayload.messages);
            const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
            ctxExpectationsFn(ctxMock, apiResponses);
            expect(nock.isDone()).toBe(true);
        });
    });

    test(`should handle scenario 'skip_batch`, async() => {
        const scenarioName = 'skip_batch';
        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
        const smartNotifierPayload = payloadSetupFn();

        ctxMock.connector = smartNotifierPayload.connector;
        ctxMock.ship = smartNotifierPayload.connector;

        const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
        const apiResponses = apiResponseSetupFn(nock);

        await syncAgent.sendUserMessages(smartNotifierPayload.messages, true);
        const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
        ctxExpectationsFn(ctxMock, apiResponses);
        expect(nock.isDone()).toBe(true);                
    });

    test(`should handle scenario 'handle_unexpectederror`, async() => {
        const scenarioName = 'handle_unexpectederror';
        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
        const smartNotifierPayload = payloadSetupFn();

        ctxMock.connector = smartNotifierPayload.connector;
        ctxMock.ship = smartNotifierPayload.connector;
        ctxMock.metric = null;

        const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
        const apiResponses = apiResponseSetupFn(nock);

        await syncAgent.sendUserMessages(smartNotifierPayload.messages);
        const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
        ctxExpectationsFn(ctxMock, apiResponses);
        expect(nock.isDone()).toBe(true);                
    });

    const statusScenariosToTest = [
        'status_ok',
        'status_setupRequired_apikey',
        'status_setupRequired_apisecretkey',
        'status_setupRequired_privatesettings'
    ];
    _.forEach(statusScenariosToTest, (scenarioName) => {
        test(`should handle scenario '${scenarioName}'`, async() => {
            const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
            const smartNotifierPayload = payloadSetupFn();
    
            ctxMock.connector = smartNotifierPayload.connector;
            ctxMock.ship = smartNotifierPayload.connector;
    
            const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);
    
            const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
            const apiResponses = apiResponseSetupFn(nock);
    
            await syncAgent.determineConnectorStatus();
            const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
            ctxExpectationsFn(ctxMock, apiResponses);
            expect(nock.isDone()).toBe(true);                
        });
    });

    const webhookScenariosToTest = [
        'webhook_sent',
        'webhook_open',
        'webhook_click',
        'webhook_bounce',
        'webhook_blocked',
        'webhook_spam',
        'webhook_unsub',
        'webhook_unknown'
    ];

    _.forEach(webhookScenariosToTest, (scenarioName) => {
        test(`should handle scenario '${scenarioName}'`, async() => {

            const webhookPayload: IMailjetEvent = require(`../data/${scenarioName}.json`);
            webhookPayload.MessageID = MJ_EVENT_ID;
            webhookPayload.Message_GUID = MJ_EVENT_GUID;
            webhookPayload.email = MJ_IDENT1_EMAIL;
            webhookPayload.mj_campaign_id = MJ_EVENT_CAMPAIGNID;
            webhookPayload.mj_contact_id = MJ_IDENT1_ID;
            webhookPayload.time = MJ_EVENT_TIME;
            
    
            const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);
    
            const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
            const apiResponses = apiResponseSetupFn(nock);
    
            await syncAgent.handleEventCallbacks(webhookPayload);
            const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
            ctxExpectationsFn(ctxMock, apiResponses);
            expect(nock.isDone()).toBe(true);                
        });
    });

    test(`should handle scenario 'webhook_test'`, async() => {
        const scenarioName = 'webhook_test';
        const webhookPayload: IMailjetEvent = require(`../data/${scenarioName}.json`);
        webhookPayload.MessageID = MJ_EVENT_ID;
        webhookPayload.Message_GUID = MJ_EVENT_GUID;
        webhookPayload.email = "";
        webhookPayload.mj_campaign_id = MJ_EVENT_CAMPAIGNID;
        webhookPayload.mj_contact_id = 0;
        webhookPayload.time = MJ_EVENT_TIME;
        

        const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
        const apiResponses = apiResponseSetupFn(nock);

        await syncAgent.handleEventCallbacks(webhookPayload);
        const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
        ctxExpectationsFn(ctxMock, apiResponses);
        expect(nock.isDone()).toBe(true);                
    });

    test(`should handle scenario 'eventcallbacks_create'`, async() => {
        const scenarioName = 'eventcallbacks_create';        

        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
        const smartNotifierPayload = payloadSetupFn();

        ctxMock.connector = smartNotifierPayload.connector;
        ctxMock.ship = smartNotifierPayload.connector;

        ctxMock.client.get = jest.fn(() => Promise.resolve(smartNotifierPayload.connector));

        const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
        const apiResponses = apiResponseSetupFn(nock);

        await syncAgent.ensureEventCallbackUrls(true);
        const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
        ctxExpectationsFn(ctxMock, apiResponses);
        expect(nock.isDone()).toBe(true);                
    });
    
    test(`should handle scenario 'eventcallbacks_delete'`, async() => {
        const scenarioName = 'eventcallbacks_delete';        

        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
        const smartNotifierPayload = payloadSetupFn();

        ctxMock.connector = smartNotifierPayload.connector;
        ctxMock.ship = smartNotifierPayload.connector;

        ctxMock.client.get = jest.fn(() => Promise.resolve(smartNotifierPayload.connector));

        const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
        const apiResponses = apiResponseSetupFn(nock);

        await syncAgent.ensureEventCallbackUrls(true);
        const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
        ctxExpectationsFn(ctxMock, apiResponses);
        expect(nock.isDone()).toBe(true);                
    });

    test(`should handle scenario 'eventcallbacks_clearall'`, async() => {
        const scenarioName = 'eventcallbacks_clearall';        

        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/sn-payload`).default;
        const smartNotifierPayload = payloadSetupFn();

        ctxMock.connector = smartNotifierPayload.connector;
        ctxMock.ship = smartNotifierPayload.connector;

        ctxMock.client.get = jest.fn(() => Promise.resolve(smartNotifierPayload.connector));
        ctxMock.client.utils = {
            settings: {
                update: jest.fn(() => Promise.resolve(true))
            }
        };
        const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

        const apiResponseSetupFn: (nock: any) => IApiResponseNocked[] = require(`../_scenarios/${scenarioName}/api-responses`).default;
        const apiResponses = apiResponseSetupFn(nock);

        await syncAgent.clearEventCallbackUrls();
        const ctxExpectationsFn: (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
        ctxExpectationsFn(ctxMock, apiResponses);
        expect(nock.isDone()).toBe(true);                
    });
});