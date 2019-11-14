import nock from "nock";
import { Url } from "url";
import _ from "lodash";

import { API_BASE_URL, MJ_IDENT1_EMAIL, AUTH_HEADER_CHECK, MJ_IDENT1_ID, HULL_USER_NAME1, MJ_EVENTCALLBACK_IDS, MJ_APIKEY } from "../../_helpers/constants";
import ApiresponseV3ContactById from "../../data/apiresponse_v3_contactbyid.json";
import ApiresponseV3ContactPut from "../../data/apiresponse_v3_putcontact.json";
import ApiresponseV3ContactGetSubscriberIds from "../../data/apiresponse_v3_listrecipient.json";
import ApiresponseV3ContactDataById from "../../data/apiresponse_v3_contactdatabyid.json";
import ApiresponseV3EventCallbacksList from "../../data/apiresponse_v3_eventcallbackurl.json";
import { IApiResponseNocked } from "../../_helpers/types";
import { IMailjetEventCallbackUrlCreate, IMailjetEventCallbackUrl } from "../../../src/core/mailjet-objects";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope): IApiResponseNocked[] => {
    const apiResponses: IApiResponseNocked[] = [];

    // GET Event Callback URLs
    const offset1 = 0;
    const limit1 = 1000;
    const responseBody1 = _.cloneDeep(ApiresponseV3EventCallbacksList);
    responseBody1.Count = 0;
    responseBody1.Total = 0;
    responseBody1.Data = []
    const url1 = `${API_BASE_URL}/v3/REST/eventcallbackurl?Limit=${limit1}&Offset=${offset1}`;

    nockFn(`${API_BASE_URL}`)
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .get(`/v3/REST/eventcallbackurl?Limit=${limit1}&Offset=${offset1}`)
        .reply(200, responseBody1);
    
    apiResponses.push({
        data: responseBody1,
        endpoint: url1,
        method: "query",
        record: undefined,
        success: true
    });

    // POST Event Callback Url
    nockFn(`${API_BASE_URL}`)
        .persist()
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .post(`/v3/REST/eventcallbackurl`)
        .reply(200, (_uri: string, body: nock.ReplyBody) => {
            const reqBody: IMailjetEventCallbackUrlCreate = JSON.parse(body.valueOf() as any);
            // tslint:disable-next-line:no-console
            console.log(_.isString(reqBody), reqBody);
            const cbId = MJ_EVENTCALLBACK_IDS[reqBody.EventType];
            const resBody: IMailjetEventCallbackUrl = {
                ...reqBody,
                ID: cbId,
                APIKeyID: MJ_APIKEY,
                Version: 1
            };
            

            return { 
                Count: 1,
                Data: [resBody],
                Total: 1
            };
        });

    return apiResponses;
};

export default setupApiMockResponses;