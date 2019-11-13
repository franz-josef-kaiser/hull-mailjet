import _ from "lodash";
import payload from "../../data/hull_notification_userupdate.json";
import { API_KEY, API_SECRET_KEY, CONCONF_SUBACCOUNT_SLUG, HULL_SEGMENT1, MJ_LIST1, HULL_USER_NAME1, HULL_USER_JOBTITLE1, CONCONF_OUTBOUND_ATTRIBS, HULL_SEGMENT2, MJ_LIST2 } from "../../_helpers/constants";
import IHullUserUpdateMessage from "../../../src/types/user-update-message";

const basePayload = _.cloneDeep(payload);

const configurePayload = (): IHullUserUpdateMessage => {
    // Configure authentication
    _.unset(basePayload, "connector.private_settings.api_key");
    _.unset(basePayload, "connector.private_settings.api_secret_key");
    // Configure the mailjet list to hull segment mappings
    _.set(basePayload, "connector.private_settings.contact_synchronized_segments", [{
        hull_segment_id: HULL_SEGMENT1.id,
        service_list_id: MJ_LIST1.ID
    }, {
        hull_segment_id: HULL_SEGMENT2.id,
        service_list_id: MJ_LIST2.ID
    }]);
    // Configure subaccount slug
    _.set(basePayload, "connector.private_settings.subaccount_slug", CONCONF_SUBACCOUNT_SLUG);

    // Make sure user has no email
    _.unset(basePayload, "messages[0].user.email");

    // Ensure that the user is in the configured segment
    _.set(basePayload, "messages[0].segments", [ HULL_SEGMENT1, HULL_SEGMENT2 ]);
    
    return basePayload as any;
};

export default configurePayload;