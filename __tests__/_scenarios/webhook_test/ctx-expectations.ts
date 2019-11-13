import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { MJ_IDENT1_EMAIL, MJ_IDENT1_ID, MJ_EVENT_TIME, MJ_EVENT_ID, MJ_EVENT_GUID, MJ_EVENT_CAMPAIGNID } from "../../_helpers/constants";
import { MJ_EVENT_MAPPING } from "../../../src/core/constants";
import IHullUserEvent from "../../../src/types/user-event";
import moment from "moment";

const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check logged metrics
    expect(ctx.metric.increment.mock.calls).toHaveLength(apiResponses.length); // Total number of api calls
    
    const hullEvent: IHullUserEvent = {
        created_at: moment.unix(MJ_EVENT_TIME).toISOString(),
        event: MJ_EVENT_MAPPING.sent,
        properties: {
            "event": "sent",
            "time": MJ_EVENT_TIME,
            "message_id": MJ_EVENT_ID,
            "message_guid": MJ_EVENT_GUID,
            "email": "",
            "mj_campaign_id": MJ_EVENT_CAMPAIGNID,
            "mj_contact_id": 0,
            "customcampaign": "",
            "mj_message_id": `${MJ_EVENT_ID}`,
            "smtp_reply": "sent (250 2.0.0 OK 1433333948 fa5si855896wjc.199 - gsmtp)",
            "custom_id": "helloworld",
            "payload": ""
        },
        context: {
            ip: 0
        }
    };

    // Check debug logs for API results
    expect((ctx.client.logger.log as any).mock.calls).toHaveLength(1); // Successful API calls only
    expect((ctx.client.logger.log as any).mock.calls[0]).toEqual([
        "incoming.event.test",
        {
            ident: {
                email: "",
                anonymous_id: "mailjet:0"
            },
            event: hullEvent
        }
    ]);
    // Check track call
    expect((ctx.client as any).track.mock.calls).toHaveLength(0); // No call to Hull
};

export default setupExpectations;