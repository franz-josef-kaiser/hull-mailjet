import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { MJ_IDENT1_EMAIL, MJ_IDENT1_ID, MJ_EVENT_TIME, MJ_EVENT_ID, MJ_EVENT_GUID, MJ_EVENT_CAMPAIGNID } from "../../_helpers/constants";
import { MJ_EVENT_MAPPING, ERROR_INCOMING_EVENT_UNKNOWN } from "../../../src/core/constants";
import IHullUserEvent from "../../../src/types/user-event";
import moment from "moment";

const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check logged metrics
    expect(ctx.metric.increment.mock.calls).toHaveLength(apiResponses.length); // Total number of api calls
    const webhookPayload = require("../../data/webhook_unknown.json");
    webhookPayload.MessageID = MJ_EVENT_ID;
    webhookPayload.Message_GUID = MJ_EVENT_GUID;
    webhookPayload.email = MJ_IDENT1_EMAIL;
    webhookPayload.mj_campaign_id = MJ_EVENT_CAMPAIGNID;
    webhookPayload.mj_contact_id = MJ_IDENT1_ID;
    webhookPayload.time = MJ_EVENT_TIME;
    // Check debug logs for API results
    expect((ctx.client.logger.error as any).mock.calls).toHaveLength(1); // Successful API calls only
    expect((ctx.client.logger.error as any).mock.calls[0]).toEqual([
        "incoming.event.error",
        {
            reason: ERROR_INCOMING_EVENT_UNKNOWN,
            event: webhookPayload
        }
    ]);
    // Check track call
    expect((ctx.client as any).track.mock.calls).toHaveLength(0); // No call to Hull
};

export default setupExpectations;