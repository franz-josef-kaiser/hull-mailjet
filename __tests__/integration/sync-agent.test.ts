import { ContextMock } from "../_helpers/mocks";
import nock from "nock";
import _ from "lodash";
import SyncAgent from "../../src/core/sync-agent";
import IPrivateSettings from "../../src/types/private-settings";

import ApiresponseV3Contactmetadata from "../data/apiresponse_v3_contactmetadata.json";
import ApiresponseV3Contactslist from "../data/apiresponse_v3_contactslist.json";
import { IApiResponseNocked } from "../_helpers/types";

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
});