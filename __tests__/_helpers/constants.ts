export const API_KEY = "api1234";
export const API_SECRET_KEY = "secret56789";
export const API_BASE_URL = 'https://api.mailjet.com';

export const AUTH_HEADER_CHECK = "Basic YXBpMTIzNDpzZWNyZXQ1Njc4OQ==";

export const CONCONF_SUBACCOUNT_SLUG = "Dev";
export const CONCONF_OUTBOUND_ATTRIBS = [{
        hull_field_name: 'custom/foo',
        service_field_name: 'title'
    },
    {
        hull_field_name: 'traits_unified_data/job_title',
        service_field_name: 'job_title'
    }
];

export const HULL_USER_NAME0 = "John Doe";

export const HULL_USER_NAME1 = "Sean Dyer";
export const HULL_USER_JOBTITLE1 = "Data Magician";
export const HULL_SEGMENT1 = {
    "id": "5dc3471125bb5ef068000053",
    "updated_at": "2019-11-06T22:20:01Z",
    "created_at": "2019-11-06T22:20:01Z",
    "name": "Mailjet Test Users",
    "type": "users_segment",
    "stats": {}
};
export const HULL_SEGMENT2 = {
    "id": "5dc3471125bb5ef068000054",
    "updated_at": "2019-11-06T22:20:01Z",
    "created_at": "2019-11-06T22:20:01Z",
    "name": "Mailjet Test Users 2",
    "type": "users_segment",
    "stats": {}
};

export const MJ_LIST1 = {
    "Address": "e8qnwdl8r",
    "CreatedAt": "2019-06-12T07:15:36Z",
    "ID": 1115,
    "IsDeleted": false,
    "Name": "Demo list",
    "SubscriberCount": 14
};

export const MJ_LIST2 = {
    "Address": "Tdlzccko9",
    "CreatedAt": "2019-08-01T12:50:35Z",
    "ID": 2818,
    "IsDeleted": false,
    "Name": "_TEST",
    "SubscriberCount": 0
};

export const MJ_IDENT1_EMAIL = "john.doe@hull.io";
export const MJ_IDENT1_ID = 1234;

export const MJ_LISTRECIPS1 = [
    {
        "ContactID": 1234,
        "ID": 1443964,
        "IsActive": true,
        "IsUnsubscribed": false,
        "ListID": 1115,
        "ListName": "Demo list",
        "SubscribedAt": "2019-06-25T10:52:30Z",
        "UnsubscribedAt": ""
    },
    {
        "ContactID": 1234,
        "ID": 1443964,
        "IsActive": true,
        "IsUnsubscribed": false,
        "ListID": 2818,
        "ListName": "_TEST",
        "SubscribedAt": "2019-11-05T15:21:07Z",
        "UnsubscribedAt": ""
    }
];