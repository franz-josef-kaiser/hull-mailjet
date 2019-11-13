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
        event: MJ_EVENT_MAPPING.blocked,
        properties: {
            "event": "blocked",
            "time": MJ_EVENT_TIME,
            "message_id": MJ_EVENT_ID,
            "message_guid": MJ_EVENT_GUID,
            "email": MJ_IDENT1_EMAIL,
            "mj_campaign_id": MJ_EVENT_CAMPAIGNID,
            "mj_contact_id": MJ_IDENT1_ID,
            "customcampaign": "",
            "custom_id": "helloworld",
            "payload": "",
            "error_related_to": "recipient",
            "error": "user unknown"
        },
        context: {
            ip: 0
        }
    };

    // Check debug logs for API results
    expect((ctx.client.logger.debug as any).mock.calls).toHaveLength(1); // Successful API calls only
    expect((ctx.client.logger.debug as any).mock.calls[0]).toEqual([
        "incoming.event.success",
        {
            event: hullEvent
        }
    ]);
    // Check track call
    expect((ctx.client as any).track.mock.calls).toHaveLength(1); // 1 call to Hull
    
    expect((ctx.client as any).track.mock.calls[0]).toEqual([
        hullEvent.event,
        hullEvent.properties,
        _.merge({}, hullEvent.context, {
            created_at: hullEvent.created_at,
            source: "mailjet"
        })
    ]);
};

export default setupExpectations;