import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { CONCONF_SUBACCOUNT_SLUG, MJ_IDENT1_EMAIL, MJ_IDENT1_ID, HULL_USER_NAME1, CONCONF_EVENTTYPES, CONNECTOR_ID, CONNECTOR_SECRET, CONNECTOR_HOST, CONNECTOR_ORG, API_BASE_URL, MJ_APIKEY, MJ_EVENTCALLBACK_IDS } from "../../_helpers/constants";
import IApiResultObject from "../../../src/types/api-result";
import { IMailjetPagedResult, IMailjetEventCallbackUrl, IMailjetEventCallbackUrlCreate, MailJetEventType } from "../../../src/core/mailjet-objects";
import { MJ_EVENT_MAPPING } from "../../../src/core/constants";


const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check logged metrics
    const deletedEventTypes: MailJetEventType[] = [
        "unsub", // DOES have a different host, so goes first!
        "sent"
    ];
    expect(ctx.metric.increment.mock.calls).toHaveLength(apiResponses.length + deletedEventTypes.length); // Total number of api calls
    expect(ctx.metric.increment).toBeCalledWith("ship.service_api.call", 1);
    
    // Check debug logs for API results
    expect((ctx.client.logger.debug as any).mock.calls).toHaveLength(deletedEventTypes.length); // Successful API calls only
    for (let index = 0; index < deletedEventTypes.length; index++) {
        
        const host = deletedEventTypes[index] === "unsub" ? "somefoohost.com" : CONNECTOR_HOST;
        const ecCreate: IMailjetEventCallbackUrlCreate = {
            EventType: deletedEventTypes[index],
            IsBackup: false,
            Status: "alive",
            Url: `https://${CONNECTOR_ID}:${CONNECTOR_SECRET}@${host}/eventcallback?org=${CONNECTOR_ORG}`
        };
        const apiResult: IApiResultObject<boolean, number> = {
            data: true,
            endpoint: `${API_BASE_URL}/v3/REST/eventcallbackurl/${MJ_EVENTCALLBACK_IDS[ecCreate.EventType]}`,
            method: "delete",
            record: MJ_EVENTCALLBACK_IDS[ecCreate.EventType],
            success: true
        };
        
        expect((ctx.client.logger.debug as any).mock.calls[index]).toEqual([
            "connector.webhook.success",
            { apiResult }
        ]);
    }
    // Check error logs for API results
    expect((ctx.client.logger.error as any).mock.calls).toHaveLength(0);
};

export default setupExpectations;