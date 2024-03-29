import _ from "lodash";
import slugify from "slugify";
import moment from "moment";

import IPrivateSettings, { ISegmentToContactListMappingEntry, IMappingEntry } from "../types/private-settings";
import IHullUser, { IHullUserAttributes, IHullUserClaims } from "../types/user";
import { IMailjetContactCreate, IMailjetContactDataUpdate, IMailjetContactDataEntry, IMailjetListRecipient, IMailjetContactListCrud, IMailjetContact, IMailjetEvent } from "../core/mailjet-objects";
import { MJ_ATTRIBUTE_DEFAULT_NAME, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL, MJ_ATTRIBUTE_DEFAULT_NAME_VAL, MJ_EVENT_MAPPING } from "../core/constants";
import IHullSegment from "../types/hull-segment";
import IHullUserEvent, { IHullUserEventContext } from "../types/user-event";


class MappingUtil {
    private _attributeMappings: IMappingEntry[];
    private _segmentToContactListMappings: ISegmentToContactListMappingEntry[];
    private _slugRaw: string | undefined;

    constructor(privateSettings: IPrivateSettings) {
        this._attributeMappings = privateSettings.contact_attributes_outbound;
        this._segmentToContactListMappings = privateSettings.contact_synchronized_segments;
        this._slugRaw = privateSettings.subaccount_slug;
    }

    /**
     * Maps a Hull user to a Mailjet contact object which can be used
     * to create or update a contact.
     *
     * @param {IHullUser} user The Hull user.
     * @returns {IMailjetContactCreate} The Mailjet contact.
     * @memberof MappingUtil
     */
    public mapHullUserToMailjetContactCreate(user: IHullUser): IMailjetContactCreate {
        let hullAttrName = "name";
        const mappedNameAttribute = _.find(this._attributeMappings, { service: MJ_ATTRIBUTE_DEFAULT_NAME_VAL });
        if (mappedNameAttribute !== undefined &&
            _.isString(mappedNameAttribute.hull) &&
            _.trim(mappedNameAttribute.hull).length !== 0) {
            hullAttrName = mappedNameAttribute.hull;
        }

        const subAcctSlug = this.getSubAccountSlug();
        const hullAttrGroupMailjet = subAcctSlug === undefined ? 'mailjet': `mailjet_${subAcctSlug}`;
        let hullAttrIsExcludedFromCampaigns = `${hullAttrGroupMailjet}.${_.snakeCase("IsExcludedFromCampaigns")}`;
        const mappedExclusionAttribute = _.find(this._attributeMappings, { service: MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL });
        if (mappedExclusionAttribute !== undefined &&
            _.isString(mappedExclusionAttribute.hull) &&
            _.trim(mappedExclusionAttribute.hull).length !== 0) {
            hullAttrIsExcludedFromCampaigns = mappedExclusionAttribute.hull;
        }

        const mjObject: IMailjetContactCreate = {
            Email: _.get(user, "email") as string,
            IsExcludedFromCampaigns: _.get(user, hullAttrIsExcludedFromCampaigns, false) as boolean,
            Name: _.get(user, hullAttrName, "") as string
        };

        return mjObject;
    }

    /**
     * Maps a Hull user to Mailjet contact data (aka custom properties) which can
     * be used to update those properties.
     *
     * @param {IHullUser} user The Hull user.
     * @returns {IMailjetContactDataUpdate} The Mailjet contact data.
     * @memberof MappingUtil
     */
    public mapHullUserToMailjetContactData(user: IHullUser): IMailjetContactDataUpdate {
        const customAttributeMappings = _.filter(this._attributeMappings, (m) => {
            return m.service !== MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL &&
                   m.service !== MJ_ATTRIBUTE_DEFAULT_NAME_VAL;
        });
        
        const mjObject: IMailjetContactDataUpdate = {
            Data: []
        };

        _.forEach(customAttributeMappings, (m) => {
            if (m.hull !== undefined &&
                _.isString(m.hull) &&
                m.service !== undefined &&
                _.isString(m.service) &&
                _.get(user, m.hull, undefined) !== undefined) {
                // Process only valid entries
                // NOTE: Mailjet cannot handle null as Value, so do not create
                //       any entries for undefined Hull attributes.
                const entry: IMailjetContactDataEntry = {
                    Name: m.service,
                    Value: _.get(user, m.hull) as any
                }
                mjObject.Data.push(entry);
            }
        });

        return mjObject;
    }

    /**
     * Compares the Hull segments with the list recipients and creates a list of 
     * CRUD actions for list management.
     *
     * @param {IHullSegment[]} userSegments The list of user segments the user belongs to.
     * @param {IMailjetListRecipient[]} recipients The list of list recipients for the MJ contact.
     * @returns {IMailjetContactListCrud} A list of CRUD actions for list management.
     * @memberof MappingUtil
     */
    public mapHullSegmentsToContactListActions(userSegments: IHullSegment[], recipients: IMailjetListRecipient[]): IMailjetContactListCrud {
        const listIdsFromHullSegmentsRaw: Array<number | undefined> = 
            _.map(userSegments, (seg) => {
                const mapping = _.find(this._segmentToContactListMappings, { hull_segment_id: seg.id });
                if (mapping === undefined) { return undefined; }
                return mapping.service_list_id;
            });
        const listIdsFromHullSegments: number[] = _.filter(listIdsFromHullSegmentsRaw, (lid) => {
            return _.isNil(lid) === false;
        }) as number[];
        
        const mjObject: IMailjetContactListCrud = {
            ContactsLists: []
        };

        // Determine the lists the contact needs to be subscribed to
        _.forEach(listIdsFromHullSegments, (lid) => {
            const matchingRecipient = _.find(recipients, { ListID: lid });
            if (_.isNil(matchingRecipient)) {
                mjObject.ContactsLists.push({
                    Action: "addnoforce",
                    ListID: lid
                });
            }
            // In all other cases we do not need to create an action,
            // because this would make the connector execute an `addforce`
            // action which is not compliant to GDPR and probably CCPA.
        });

        // Determine the lists the contact needs to be unsubscribed from
        _.forEach(recipients, (recipient) => {
            if (_.includes(listIdsFromHullSegments, recipient.ListID) === false &&
                recipient.IsUnsubscribed === false) {
                mjObject.ContactsLists.push({
                    Action: "unsub",
                    ListID: recipient.ListID
                });
            }
            // In all other cases we do not need to create an action
            // because we don't want to forcibly remove the contact.
        });

        return mjObject;
    }

    /**
     * Merges identifiers from Mailjet Contact and optional a Hull user into
     * claims to identify the proper Hull user.
     *
     * @param {IMailjetContact} contact The Mailjet contact.
     * @param {IHullUser} [user] The Hull user, optional.
     * @returns {IHullUserClaims} The Hull user claims.
     * @memberof MappingUtil
     */
    public mapMailjetContactToHullUserIdent(contact: IMailjetContact, user?: IHullUser ): IHullUserClaims {
        const subAcctSlug = this.getSubAccountSlug();
        const hullIdentPrefixMailjet = subAcctSlug === undefined ? 'mailjet': `mailjet_${subAcctSlug}`;
        const claims: IHullUserClaims = {
            email: _.isNil(_.get(user, "email", undefined)) ? contact.Email : _.get(user, "email"),
            anonymous_id: `${hullIdentPrefixMailjet}:${contact.ID}`
        };
        
        if (!_.isNil(_.get(user, "external_id", undefined))) {
            claims.external_id = _.get(user, "external_id");
        }

        if (!_.isNil(_.get(user, "id", undefined))) {
            claims.id = _.get(user, "id");
        }
        
        return claims;
    }

    /**
     * Creates claims for a Hull user based on the info
     * contained in the Mailjet event.
     *
     * @param {IMailjetEvent} mjEvent The Mailjet event.
     * @returns {IHullUserClaims} The Hull user claims.
     * @memberof MappingUtil
     */
    public mapMailjetEventToHullUserIdent(mjEvent: IMailjetEvent): IHullUserClaims {
        const subAcctSlug = this.getSubAccountSlug();
        const hullIdentPrefixMailjet = subAcctSlug === undefined ? 'mailjet': `mailjet_${subAcctSlug}`;
        const claims: IHullUserClaims = {
            email: mjEvent.email,
            anonymous_id: `${hullIdentPrefixMailjet}:${mjEvent.mj_contact_id}`
        };
        return claims;
    }

    /**
     * Maps Mailjet objects related to a contact to Hull user attributes
     *
     * @param {IMailjetContact} contact The Mailjet contact.
     * @param {IMailjetContactDataUpdate} contactData The Mailjet contact data (aka custom attributes).
     * @param {IMailjetListRecipient[]} recipients The list recipients for the contact.
     * @returns {IHullUserAttributes} An object representing the Hull user attributes.
     * @memberof MappingUtil
     */
    public mapMailjetObjectsToHullUserAttributes(contact: IMailjetContact, contactData?: IMailjetContactDataUpdate, recipients?: IMailjetListRecipient[]): IHullUserAttributes {
        const hullAttribs = {};
        const subAcctSlug = this.getSubAccountSlug();
        const hullAttrGroupMailjet = subAcctSlug === undefined ? 'mailjet': `mailjet_${subAcctSlug}`;

        // Top-level attributes
        _.set(hullAttribs, "name", { value: contact.Name, operation: "setIfNull" });

        // Default Mailjet attributes
        _.forIn(contact, (v, k) => {
            _.set(hullAttribs, `${hullAttrGroupMailjet}/${_.snakeCase(k)}`, v);
        });

        // Custom attributes
        if (contactData !== undefined) {
            _.forEach(contactData.Data, (d) => {
                _.set(hullAttribs, `${hullAttrGroupMailjet}/${_.snakeCase(d.Name)}`, d.Value);
            });
        }

        // Recipients as JSON so it can be leveraged in the processor
        if (recipients !== undefined) {
            _.set(hullAttribs, `${hullAttrGroupMailjet}/list_recipients`, recipients);
        }

        return hullAttribs;
    }

    /**
     * Maps a Mailjet event to a Hull event
     *
     * @param {IMailjetEvent} mjEvent The Mailjet event.
     * @returns {IHullUserEvent} The Hull event.
     * @memberof MappingUtil
     */
    public mapMailjetEventToHullEvent(mjEvent: IMailjetEvent): IHullUserEvent {
        const props = {};
        const context: IHullUserEventContext = {
            ip: _.isNil(mjEvent.ip) ? 0 : mjEvent.ip
        };

        if (_.isNil(mjEvent.agent) === false) {
            _.set(context, "useragent", mjEvent.agent);
        }

        _.forIn(mjEvent, (v, k) => {
            _.set(props, _.toLower(_.snakeCase(k)), v);
        });

        const hullEvent: IHullUserEvent = {
            created_at: moment.unix(mjEvent.time).toISOString(),
            context,
            properties: props,
            event: _.get(MJ_EVENT_MAPPING, mjEvent.event)
        };

        return hullEvent;
    }

    /**
     * Uses the value from settings for subaccount slug and
     * creates a slugified version so it can safely be used in 
     * attribute names in Hull.
     *
     * @returns {(string | undefined)} The slug or undefined if none should be used.
     * @memberof MappingUtil
     */
    public getSubAccountSlug(): string | undefined {
        if (this._slugRaw === undefined) {
            return this._slugRaw;
        }

        if (_.trim(this._slugRaw).length === 0) {
            return undefined;
        }

        const slug = slugify(this._slugRaw, {
            replacement: "_",
            remove: /[*#;,\\+~.()'"!:@\/?]/g,
            lower: true
        });

        return slug;
    }
}

export default MappingUtil;