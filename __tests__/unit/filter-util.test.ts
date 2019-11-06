import _ from "lodash";

import userUpdateMessagePayload from "../data/hull_notification_userupdate.json";
import IPrivateSettings from "../../src/types/private-settings";
import FilterUtil from "../../src/utils/filter-util";
import IHullUserUpdateMessage from "../../src/types/user-update-message";

describe("FilterUtil", () => {
    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test("should filter all messages with skip if no settings are applied", () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);
        
        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: payload.connector.private_settings.contact_attributes_outbound,
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new FilterUtil(privateSettings);

        const messages: IHullUserUpdateMessage[] = payload.messages as any[];

        const envelopes = util.filterUserMessages(messages, false);
        expect(envelopes).toHaveLength(messages.length);
        expect(_.filter(envelopes, { operation: "skip" })).toHaveLength(messages.length);
    });

    test("should filter all messages with skip if batch since not supported at the moment", () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);
        
        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: payload.connector.private_settings.contact_attributes_outbound,
            contact_synchronized_segments: payload.connector.private_settings.contact_synchronized_segments
        };

        const util = new FilterUtil(privateSettings);

        const messages: IHullUserUpdateMessage[] = payload.messages as any[];

        const envelopes = util.filterUserMessages(messages, true);
        expect(envelopes).toHaveLength(messages.length);
        expect(_.filter(envelopes, { operation: "skip" })).toHaveLength(messages.length);
    });

    test("should filter valid messages with operation insert", () => {
        const payload = _.cloneDeep(userUpdateMessagePayload);
        
        const privateSettings: IPrivateSettings = {
            api_key: payload.connector.private_settings.api_key,
            api_secret_key: payload.connector.private_settings.api_secret_key,
            contact_attributes_outbound: payload.connector.private_settings.contact_attributes_outbound,
            contact_synchronized_segments: [
                {
                    hull_segment_id: "5dc3471125bb5ef068000053",
                    service_list_id: 1000
                }
            ]
        };

        const util = new FilterUtil(privateSettings);

        const messages: IHullUserUpdateMessage[] = payload.messages as any[];

        const envelopes = util.filterUserMessages(messages, false);
        expect(envelopes).toHaveLength(messages.length);
        expect(_.filter(envelopes, { operation: "skip" })).toHaveLength(0);
        expect(_.filter(envelopes, { operation: "insert" })).toHaveLength(messages.length);
    });
});