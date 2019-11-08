import _ from "lodash";
import payload from "../../data/hull_notification_userupdate.json";
import { API_KEY, API_SECRET_KEY, API_BASE_URL, AUTH_HEADER_CHECK } from "../../_helpers/constants";
import IHullUserUpdateMessage from "../../../src/types/user-update-message";

const basePayload = _.cloneDeep(payload);

const configurePayload = (): IHullUserUpdateMessage => {
    // TODO: Configure smart-notifier payload
    return basePayload as any;
};

export default configurePayload;