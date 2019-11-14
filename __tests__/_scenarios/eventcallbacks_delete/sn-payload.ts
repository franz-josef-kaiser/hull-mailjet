import _ from "lodash";
import payload from "../../data/hull_notification_userupdate.json";
import { API_KEY, API_SECRET_KEY, CONCONF_SUBACCOUNT_SLUG, HULL_SEGMENT1, MJ_LIST1, HULL_USER_NAME1, CONCONF_EVENTTYPES } from "../../_helpers/constants";
import IHullUserUpdateMessage from "../../../src/types/user-update-message";

const basePayload = _.cloneDeep(payload);

const configurePayload = (): IHullUserUpdateMessage => {
    // Configure authentication
    _.set(basePayload, "connector.private_settings.api_key", API_KEY);
    _.set(basePayload, "connector.private_settings.api_secret_key", API_SECRET_KEY);
    // Configure the mailjet list to hull segment mappings
    _.set(basePayload, "connector.private_settings.contact_synchronized_segments", [{
        hull_segment_id: HULL_SEGMENT1.id,
        service_list_id: MJ_LIST1.ID
    }]);
    // Configure subaccount slug
    _.set(basePayload, "connector.private_settings.subaccount_slug", CONCONF_SUBACCOUNT_SLUG);
    
    // Configure event types
    _.set(basePayload, "connector.private_settings.incoming_eventcallbackurl_eventtypes", CONCONF_EVENTTYPES);
    
    return basePayload as any;
};

export default configurePayload;