import _ from "lodash";
import IPrivateSettings, { ISegmentToContactListMappingEntry } from "../types/private-settings";
import IHullUserUpdateMessage from "../types/user-update-message";
import { IOperationEnvelope } from "../core/mailjet-objects";
import { SKIP_REASON_NOEMAIL } from "../core/constants";

class FilterUtil {

    private _segmentToContactListMappings: ISegmentToContactListMappingEntry[];

    constructor(privateSettings: IPrivateSettings) {
        this._segmentToContactListMappings = privateSettings.contact_synchronized_segments;
    }

    public filterUserMessages(messages: IHullUserUpdateMessage[], isBatch: boolean = false): IOperationEnvelope[] {
        const envelopes: IOperationEnvelope[] = [];
        if (isBatch === true) {
            _.forEach(messages, (message: IHullUserUpdateMessage) => {
                envelopes.push({
                    msg: message,
                    operation: "skip",
                    reason: "Batch is not supported at the moment."
                });
            });
        } else {
            _.forEach(messages, (message: IHullUserUpdateMessage) => {
                const messageSegmentIds = message.segments.map(s => s.id);
                const filteredUserSegmentIds = this._segmentToContactListMappings.map(m => m.hull_segment_id);
                if (_.intersection(messageSegmentIds, filteredUserSegmentIds).length > 0) {
                    if (_.get(message, "user.email", null) === null) {
                        envelopes.push({
                            msg: message,
                            operation: "skip",
                            reason: SKIP_REASON_NOEMAIL
                        });
                    } else {   
                        envelopes.push({
                            msg: message,
                            operation: "insert"
                        });
                    }
                } else {
                    envelopes.push({
                        msg: message,
                        operation: "skip",
                        reason: "User doesn't belong to any of the segments defined in the Contact Filter."
                    });
                }
            });
        }
        return envelopes;        
    }
}

export default FilterUtil;