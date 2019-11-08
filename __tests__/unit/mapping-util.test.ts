import _ from "lodash";

import userUpdateMessagePayload from "../data/hull_notification_userupdate.json";
import IPrivateSettings from "../../src/types/private-settings";
import MappingUtil from "../../src/utils/mapping-util";
import IHullUser, { IHullUserClaims, IHullUserAttributes } from "../../src/types/user";
import IHullUserUpdateMessage from "../../src/types/user-update-message";
import { IMailjetContactCreate, IMailjetContactDataUpdate, IMailjetContactListCrud, IMailjetListRecipient, IMailjetContact } from "../../src/core/mailjet-objects";
import { MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL, MJ_ATTRIBUTE_DEFAULT_NAME_VAL } from "../../src/core/constants";

describe("MappingUtil", () => {
    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test('should return undefined as subaccount slug if none specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        expect(actual).toBeUndefined();
    });

    test('should return undefined as subaccount slug if empty string specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: ""
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        expect(actual).toBeUndefined();
    });

    test('should return undefined as subaccount slug if a blank string specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: " "
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        expect(actual).toBeUndefined();
    });

    test('should return a proper subaccount slug if "Marketing Germany" is specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "Marketing Germany"
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        const expected = "marketing_germany";
        expect(actual).toEqual(expected);
    });

    test('should return a proper subaccount slug if "Support & Dev" is specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "Support & Dev"
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        const expected = "support_and_dev";
        expect(actual).toEqual(expected);
    });

    test('should return a proper subaccount slug if "Foo/Bar" is specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "Foo/Bar"
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        const expected = "foobar";
        expect(actual).toEqual(expected);
    });

    test('should return a proper subaccount slug if "Foo@Bar" is specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "Foo@Bar"
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        const expected = "foobar";
        expect(actual).toEqual(expected);
    });

    test('should return a proper subaccount slug if "Foo\Bar" is specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "Foo\Bar"
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        const expected = "foobar";
        expect(actual).toEqual(expected);
    });

    test('should return a proper subaccount slug if "(Bl#rb!Baz.Ra+l?)" is specified in settings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "(Bl#rb!Baz.Ra+l?)"
        };

        const util = new MappingUtil(privateSettings);
        const actual = util.getSubAccountSlug();
        const expected = "blrbbazral";
        expect(actual).toEqual(expected);
    });

    test('should map a Hull User to a Mailjet Contact with defaults only', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new MappingUtil(privateSettings);
        const hullUser: IHullUser = (_.first(payload.messages) as any).user;
        const expected: IMailjetContactCreate = {
            Email: hullUser.email as string,
            IsExcludedFromCampaigns: false,
            Name: _.get(hullUser, "name") as string
        };
        const actual = util.mapHullUserToMailjetContactCreate(hullUser);
        expect(actual).toEqual(expected);
    });

    test('should map a Hull User to a Mailjet Contact with slugified defaults only', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments,
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        const hullUser: IHullUser = (_.first(payload.messages) as any).user;
        _.set(hullUser, `mailjet_dev.${_.snakeCase("IsExcludedFromCampaigns")}`, true);
        const expected: IMailjetContactCreate = {
            Email: hullUser.email as string,
            IsExcludedFromCampaigns: true,
            Name: _.get(hullUser, "name") as string
        };
        const actual = util.mapHullUserToMailjetContactCreate(hullUser);
        expect(actual).toEqual(expected);
    });

    test('should map a Hull User to a Mailjet Contact with custom campaign exclusion mapping', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [{
                hull_field_name: "control_data.no_email",
                service_field_name: MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL
            }],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new MappingUtil(privateSettings);
        const hullUser: IHullUser = (_.first(payload.messages) as any).user;
        _.set(hullUser, "control_data.no_email", true);
        const expected: IMailjetContactCreate = {
            Email: hullUser.email as string,
            IsExcludedFromCampaigns: true,
            Name: _.get(hullUser, "name") as string
        };
        const actual = util.mapHullUserToMailjetContactCreate(hullUser);
        expect(actual).toEqual(expected);
    });

    test('should map a Hull User to a Mailjet Contact with custom name mapping', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [{
                hull_field_name: "unified_data.name",
                service_field_name: MJ_ATTRIBUTE_DEFAULT_NAME_VAL
            }],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new MappingUtil(privateSettings);
        const hullUser: IHullUser = (_.first(payload.messages) as any).user;
        _.set(hullUser, "unified_data.name", "John Brooke");
        const expected: IMailjetContactCreate = {
            Email: hullUser.email as string,
            IsExcludedFromCampaigns: false,
            Name: "John Brooke"
        };
        const actual = util.mapHullUserToMailjetContactCreate(hullUser);
        expect(actual).toEqual(expected);
    });

    test('should map a Hull User to an empty array of Mailjet Contact Data with defaults only', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new MappingUtil(privateSettings);
        const hullUser: IHullUser = (_.first(payload.messages) as any).user;
        const expected: IMailjetContactDataUpdate = {
            Data: []
        };
        const actual = util.mapHullUserToMailjetContactData(hullUser);
        expect(actual).toEqual(expected);
    });

    test('should map a Hull User to an array of Mailjet Contact Data skipping undefined values and invalid mappings', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [
                {
                    hull_field_name: undefined,
                    service_field_name: "salutation_suffix"
                },
                {
                    hull_field_name: "name",
                    service_field_name: undefined
                },
                {
                    hull_field_name: "non_existing.country",
                    service_field_name: "country"
                },
                {
                    hull_field_name: "first_name",
                    service_field_name: "first_name"
                }
            ],
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new MappingUtil(privateSettings);
        const hullUser: IHullUser = (_.first(payload.messages) as any).user;
        const expected: IMailjetContactDataUpdate = {
            Data: [{
                Name: "first_name",
                Value: _.get(hullUser, "first_name") as string
            }]
        };
        const actual = util.mapHullUserToMailjetContactData(hullUser);
        expect(actual).toEqual(expected);
    });

    test('should map Hull user segments to Mailjet Contact List subscribe actions', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };
        const hullSegments = ((_.first(payload.messages) as any) as IHullUserUpdateMessage).segments;
        _.forEach(hullSegments, (s) => {
            privateSettings.contact_synchronized_segments.push({
                hull_segment_id: s.id,
                service_list_id: 1115
            });
        });
        const util = new MappingUtil(privateSettings);
        const expected: IMailjetContactListCrud = {
            ContactsLists: _.map(hullSegments, (s) => {
                return {
                    ListID: 1115,
                    Action: "addnoforce"
                };
            })
        };
        const actual = util.mapHullSegmentsToContactListActions(hullSegments, []);
        expect(actual).toEqual(expected);
    });

    test('should map Hull user segments to Mailjet Contact List unsubscribe actions', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };
        const hullSegments = ((_.first(payload.messages) as any) as IHullUserUpdateMessage).segments;
        _.forEach(hullSegments, (s) => {
            privateSettings.contact_synchronized_segments.push({
                hull_segment_id: s.id,
                service_list_id: 1115
            });
        });
        const util = new MappingUtil(privateSettings);
        const expected: IMailjetContactListCrud = {
            ContactsLists: _.map(hullSegments, (s) => {
                return {
                    ListID: 1115,
                    Action: "addnoforce"
                };
            })
        };
        expected.ContactsLists.push({
            ListID: 2818,
            Action: "unsub"
        });
        const recipients: IMailjetListRecipient[] = [
            {
                ContactID: 1234,
                ID: 24752,
                IsUnsubscribed: false,
                ListID: 2818,
                ListName: "_TEST",
                SubscribedAt: "2019-06-25T10:52:30Z",
                UnsubscribedAt: ""
            }
        ];
        const actual = util.mapHullSegmentsToContactListActions(hullSegments, recipients);
        expect(actual).toEqual(expected);
    });

    test('should not map Hull user segments to Mailjet Contact List subscribe actions if no mapping exists for a given segment', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };
        const hullSegments = ((_.first(payload.messages) as any) as IHullUserUpdateMessage).segments;
        _.forEach(hullSegments, (s) => {
            privateSettings.contact_synchronized_segments.push({
                hull_segment_id: s.id,
                service_list_id: 1115
            });
        });
        const util = new MappingUtil(privateSettings);
        const expected: IMailjetContactListCrud = {
            ContactsLists: _.map(hullSegments, (s) => {
                return {
                    ListID: 1115,
                    Action: "addnoforce"
                };
            })
        };
        hullSegments.push({
            created_at: "2019-06-25T10:52:30Z",
            id: "4110f97415164d62b95851a00435fb9d",
            name: "Some random segment",
            stats: {
                users: 1,
                accounts: 0
            },
            type: "users_segment",
            updated_at: "2019-06-25T10:52:30Z"
        });
        const actual = util.mapHullSegmentsToContactListActions(hullSegments, []);
        expect(actual).toEqual(expected);
    });

    test('should not map Hull user segments to Mailjet Contact List if contact is already subscribed', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };
        const hullSegments = ((_.first(payload.messages) as any) as IHullUserUpdateMessage).segments;
        _.forEach(hullSegments, (s) => {
            privateSettings.contact_synchronized_segments.push({
                hull_segment_id: s.id,
                service_list_id: 1115
            });
        });
        const util = new MappingUtil(privateSettings);
        const recipients: IMailjetListRecipient[] = [
            {
                ContactID: 1234,
                ID: 24752,
                IsUnsubscribed: false,
                ListID: 1115,
                ListName: "Test list",
                SubscribedAt: "2019-06-25T10:52:30Z",
                UnsubscribedAt: ""
            }
        ]
        const expected: IMailjetContactListCrud = {
            ContactsLists: []
        };
        const actual = util.mapHullSegmentsToContactListActions(hullSegments, recipients);
        expect(actual).toEqual(expected);
    });

    test('should map a Mailjet Contact to Hull user ident (no Hull user or subaccount slug)', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: []
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const expected: IHullUserClaims = {
            email: contact.Email,
            anonymous_id: `mailjet:${contact.ID}`
        };

        const actual = util.mapMailjetContactToHullUserIdent(contact);
        expect(actual).toEqual(expected);

    });

    test('should map a Mailjet Contact to Hull user ident (no Hull user)', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const expected: IHullUserClaims = {
            email: contact.Email,
            anonymous_id: `mailjet_dev:${contact.ID}`
        };

        const actual = util.mapMailjetContactToHullUserIdent(contact);
        expect(actual).toEqual(expected);

    });

    test('should map a Mailjet Contact to Hull user ident (with Hull user id and email)', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const hullUser: IHullUser = {
            anonymous_id: null,
            email: "jdoe@hull.io",
            external_id: null,
            id: "1524657736705"
        }

        const expected: IHullUserClaims = {
            email: hullUser.email,
            anonymous_id: `mailjet_dev:${contact.ID}`,
            id: hullUser.id
        };

        const actual = util.mapMailjetContactToHullUserIdent(contact, hullUser);
        expect(actual).toEqual(expected);

    });

    test('should map a Mailjet Contact to Hull user ident (with Hull user id, email and external_id)', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const hullUser: IHullUser = {
            anonymous_id: null,
            email: "jdoe@hull.io",
            external_id: "test1234",
            id: "1524657736705"
        }

        const expected: IHullUserClaims = {
            email: hullUser.email,
            anonymous_id: `mailjet_dev:${contact.ID}`,
            id: hullUser.id,
            external_id: hullUser.external_id
        };

        const actual = util.mapMailjetContactToHullUserIdent(contact, hullUser);
        expect(actual).toEqual(expected);

    });

    test('should map Mailjet Objects to Hull user atrributes (no contact data or list recipients) without subaccount slug', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: []
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const expected: IHullUserAttributes = {
            name: { value: contact.Name, operation: "setIfNull" }
        };

        _.forIn(contact, (v, k) => {
            _.set(expected, `mailjet/${_.snakeCase(k)}`, v);
        });

        const actual = util.mapMailjetObjectsToHullUserAttributes(contact);
        expect(actual).toEqual(expected);

    });

    test('should map Mailjet Objects to Hull user attributes (no contact data or list recipients)', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const expected: IHullUserAttributes = {
            name: { value: contact.Name, operation: "setIfNull" }
        };

        _.forIn(contact, (v, k) => {
            _.set(expected, `mailjet_dev/${_.snakeCase(k)}`, v);
        });

        const actual = util.mapMailjetObjectsToHullUserAttributes(contact);
        expect(actual).toEqual(expected);

    });

    test('should map Mailjet Objects to Hull user attributes (no list recipients)', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const contactData: IMailjetContactDataUpdate = {
            Data: [
                {
                    "Name": "first_name",
                    "Value": "John"
                },
                {
                    "Name": "job_title",
                    "Value": "Test Dummy"
                },
                {
                    "Name": "last_name",
                    "Value": "Doe"
                }
            ]
        }

        const expected: IHullUserAttributes = {
            name: { value: contact.Name, operation: "setIfNull" }
        };

        _.forIn(contact, (v, k) => {
            _.set(expected, `mailjet_dev/${_.snakeCase(k)}`, v);
        });

        _.forEach(contactData.Data, (d) => {
            _.set(expected, `mailjet_dev/${_.snakeCase(d.Name)}`, d.Value);
        });

        const actual = util.mapMailjetObjectsToHullUserAttributes(contact, contactData);
        expect(actual).toEqual(expected);

    });

    test('should map Mailjet Objects to Hull user attributes', () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);

        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: [],
            contact_synchronized_segments: [],
            subaccount_slug: "dev"
        };

        const util = new MappingUtil(privateSettings);
        
        const contact: IMailjetContact = {
            CreatedAt: "2019-06-25T10:52:30Z",
            DeliveredCount: 0,
            Email: "john.doe@hull.io",
            ExclusionFromCampaignsUpdatedAt: "",
            ID: 1536839,
            IsExcludedFromCampaigns: false,
            IsOptInPending: false,
            IsSpamComplaining: false,
            LastActivityAt: "2019-06-25T10:52:30Z",
            LastUpdateAt: "2019-06-25T10:52:30Z",
            Name: "John Doe"
        };

        const contactData: IMailjetContactDataUpdate = {
            Data: [
                {
                    "Name": "first_name",
                    "Value": "John"
                },
                {
                    "Name": "job_title",
                    "Value": "Test Dummy"
                },
                {
                    "Name": "last_name",
                    "Value": "Doe"
                }
            ]
        };

        const recipients: IMailjetListRecipient[] = [
            {
                "ContactID": 1536839,
                "ID": 1443964,
                "IsUnsubscribed": false,
                "ListID": 1115,
                "ListName": "Demo list",
                "SubscribedAt": "2019-06-25T10:52:30Z",
                "UnsubscribedAt": ""
            }
        ];

        const expected: IHullUserAttributes = {
            name: { value: contact.Name, operation: "setIfNull" }
        };

        _.forIn(contact, (v, k) => {
            _.set(expected, `mailjet_dev/${_.snakeCase(k)}`, v);
        });

        _.forEach(contactData.Data, (d) => {
            _.set(expected, `mailjet_dev/${_.snakeCase(d.Name)}`, d.Value);
        });

        _.set(expected, `mailjet_dev/list_recipients`, recipients);

        const actual = util.mapMailjetObjectsToHullUserAttributes(contact, contactData, recipients);
        expect(actual).toEqual(expected);

    });
});