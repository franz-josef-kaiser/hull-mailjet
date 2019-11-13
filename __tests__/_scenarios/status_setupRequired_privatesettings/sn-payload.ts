import _ from "lodash";
import payload from "../../data/hull_notification_userupdate.json";
import { API_KEY, API_SECRET_KEY, CONCONF_SUBACCOUNT_SLUG, HULL_SEGMENT1, MJ_LIST1, HULL_USER_NAME1, HULL_USER_JOBTITLE1, CONCONF_OUTBOUND_ATTRIBS, HULL_SEGMENT2, MJ_LIST2 } from "../../_helpers/constants";
import IHullUserUpdateMessage from "../../../src/types/user-update-message";

const basePayload = _.cloneDeep(payload);

const configurePayload = (): IHullUserUpdateMessage => {
    // Unset the private_settings
    _.unset(basePayload, "connector.private_settings");

    // Ensure that the user is in the configured segment
    _.set(basePayload, "messages[0].segments", [ HULL_SEGMENT1, HULL_SEGMENT2 ]);
    
    return basePayload as any;
};

export default configurePayload;