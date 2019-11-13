import nock from "nock";
import { Url } from "url";
import _ from "lodash";

import { API_BASE_URL, MJ_IDENT1_EMAIL, AUTH_HEADER_CHECK, MJ_IDENT1_ID, HULL_USER_NAME1, HULL_USER_JOBTITLE1, MJ_LIST2, MJ_LISTRECIPS1 } from "../../_helpers/constants";
import ApiresponseV3ContactById from "../../data/apiresponse_v3_contactbyid.json";
import ApiresponseV3ContactGetSubscriberIds from "../../data/apiresponse_v3_listrecipient.json";
import ApiresponseV3ContactDataById from "../../data/apiresponse_v3_contactdatabyid.json";
import ApiresponseV3ContactManageContactLists from "../../data/apiresponse_v3_managecontactslists.json";
import { IApiResponseNocked } from "../../_helpers/types";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope): IApiResponseNocked[] => {
    const apiResponses: IApiResponseNocked[] = [];

    // GET Contact By Id (via email)
    const responseBody1 = _.cloneDeep(ApiresponseV3ContactById);
    responseBody1.Count = 1;
    responseBody1.Total = 1;
    responseBody1.Data[0].Email = MJ_IDENT1_EMAIL;
    responseBody1.Data[0].ID = MJ_IDENT1_ID;
    const url1 = `${API_BASE_URL}/v3/REST/contact/${MJ_IDENT1_EMAIL}`;

    nockFn(`${API_BASE_URL}`)
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .get(`/v3/REST/contact/${MJ_IDENT1_EMAIL}`)
        .reply(200, responseBody1);
    
    apiResponses.push({
        data: responseBody1,
        endpoint: url1,
        method: "query",
        record: undefined,
        success: true
    });

    // GET List Recipients with Contact ID
    const limit1b = 1000;
    const offset1b = 0;
    const responseBody1b = _.cloneDeep(ApiresponseV3ContactGetSubscriberIds);
    responseBody1b.Data[0].ContactID = MJ_IDENT1_ID;
    const url1b = `${API_BASE_URL}/v3/REST/listrecipient?Limit=${limit1b}&Offset=${offset1b}&Contact=${MJ_IDENT1_ID}`;

    nockFn(`${API_BASE_URL}`)
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .get(`/v3/REST/listrecipient?Limit=${limit1b}&Offset=${offset1b}&Contact=${MJ_IDENT1_ID}`)
        .reply(200, responseBody1b);

    apiResponses.push({
        data: responseBody1b,
        endpoint: url1b,
        method: "query",
        record: undefined,
        success: true
    });

    // POST Contact Manage Contacts Lists 
    const apiResponse3 = _.cloneDeep(ApiresponseV3ContactManageContactLists);
    apiResponse3.Data[0].ContactsLists.push({
        Action: "addnoforce",
        ListID: MJ_LIST2.ID
    });
    const url3 = `${API_BASE_URL}/v3/REST/contact/${MJ_IDENT1_ID}/managecontactslists`;
    nockFn(`${API_BASE_URL}`)
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .post(`/v3/REST/contact/${MJ_IDENT1_ID}/managecontactslists`)
        .reply(201, apiResponse3);
    
    apiResponses.push({
        data: apiResponse3,
        endpoint: url3,
        method: "insert",
        record: {
            ContactsLists: [
                {
                    "Action": "addnoforce",
                    "ListID": MJ_LIST2.ID
                }
            ]
        },
        success: true
    });

    // GET Contact Data
    const responseBody4 = _.cloneDeep(ApiresponseV3ContactDataById);
    responseBody4.Data[0].ID = MJ_IDENT1_ID;
    responseBody4.Data[0].ContactID = MJ_IDENT1_ID;
    responseBody4.Data[0].Data = [];
    const url4 = `${API_BASE_URL}/v3/REST/contactdata/${MJ_IDENT1_ID}`;

    apiResponses.push({
        data: responseBody4,
        endpoint: url4,
        method: "query",
        record: undefined,
        success: true
    });

    nockFn(`${API_BASE_URL}`)
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .get(`/v3/REST/contactdata/${MJ_IDENT1_ID}`)
        .reply(200, responseBody4);

    // GET List Recipients with Contact ID
    const limit5 = 1000;
    const offset5 = 0;
    const responseBody5 = _.cloneDeep(ApiresponseV3ContactGetSubscriberIds);
    responseBody5.Data[0].ContactID = MJ_IDENT1_ID;
    responseBody5.Data = MJ_LISTRECIPS1;
    const url5 = `${API_BASE_URL}/v3/REST/listrecipient?Limit=${limit5}&Offset=${offset5}&Contact=${MJ_IDENT1_ID}`;

    nockFn(`${API_BASE_URL}`)
        .matchHeader('Authorization', AUTH_HEADER_CHECK)
        .get(`/v3/REST/listrecipient?Limit=${limit5}&Offset=${offset5}&Contact=${MJ_IDENT1_ID}`)
        .reply(429);

    apiResponses.push({
        data: "",
        endpoint: url5,
        method: "query",
        record: undefined,
        success: false,
        error: [
            "Request failed with status code 429"
        ]
    });


    return apiResponses;
};

export default setupApiMockResponses;