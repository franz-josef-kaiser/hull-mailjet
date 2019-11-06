import _ from "lodash";
import slugify from "slugify";

import IPrivateSettings, { ISegmentToContactListMappingEntry, IMappingEntry } from "../types/private-settings";
import IHullUser from "../types/user";
import { IMailjetContactCreate } from "../core/mailjet-objects";
import { MJ_ATTRIBUTE_DEFAULT_NAME, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS } from "../core/constants";

class MappingUtil {
    private _attributeMappings: IMappingEntry[];
    private _segmentToContactListMappings: ISegmentToContactListMappingEntry[];
    private _slugRaw: string | undefined;

    constructor(privateSettings: IPrivateSettings) {
        this._attributeMappings = privateSettings.contact_attributes_outbound || [];
        this._segmentToContactListMappings = privateSettings.contact_synchronized_segments || [];
        this._slugRaw = privateSettings.subaccount_slug;
    }

    public mapHullUserToMailjetContactCreate(user: IHullUser): IMailjetContactCreate {
        let hullAttrName = "name";
        const mappedNameAttribute = _.find(this._attributeMappings, { service_field_name: MJ_ATTRIBUTE_DEFAULT_NAME });
        if (mappedNameAttribute !== undefined &&
            _.isString(mappedNameAttribute.hull_field_name) &&
            _.trim(mappedNameAttribute.hull_field_name).length !== 0) {
            hullAttrName = mappedNameAttribute.hull_field_name;
        }

        const subAcctSlug = this.getSubAccountSlug();
        const hullAttrGroupMailjet = subAcctSlug === undefined ? 'mailjet': `mailjet_${subAcctSlug}`;
        let hullAttrIsExcludedFromCampaigns = `${hullAttrGroupMailjet}.${_.snakeCase("IsExcludedFromCampaigns")}`;
        const mappedExclusionAttribute = _.find(this._attributeMappings, { service_field_name: MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS });
        if (mappedExclusionAttribute !== undefined &&
            _.isString(mappedExclusionAttribute.hull_field_name) &&
            _.trim(mappedExclusionAttribute.hull_field_name).length !== 0) {
            hullAttrIsExcludedFromCampaigns = mappedExclusionAttribute.hull_field_name;
        }

        const mjObject: IMailjetContactCreate = {
            Email: _.get(user, "email") as string,
            IsExcludedFromCampaigns: _.get(user, hullAttrIsExcludedFromCampaigns, false) as boolean,
            Name: _.get(user, hullAttrName, "") as string
        };

        return mjObject;
    }

    public getSubAccountSlug(): string | undefined {
        if (this._slugRaw === undefined) {
            return this._slugRaw;
        }

        const slug = slugify(this._slugRaw, {
            replacement: "_",
            remove: /[*+~.()'"!:@&]/g,
            lower: true
        });

        return slug;
    }
}

export default MappingUtil;