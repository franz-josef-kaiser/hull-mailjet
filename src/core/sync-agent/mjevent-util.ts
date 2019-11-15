import _ from "lodash";
import { IMailjetEvent } from "../mailjet-objects";
import MappingUtil from "../../utils/mapping-util";
import { MJ_EVENT_MAPPING, ERROR_INCOMING_EVENT_UNKNOWN } from "../constants";
import { UnknownMailjetEventError } from "../errors/index";
import LoggingUtil from "../../utils/logging-util";
import IHullUserEvent from "../../types/user-event";
import { IHullUserClaims } from "../../types/user";
import IHullClient from "../../types/hull-client";

class MailjetEventUtil {
    private _mappingUtil: MappingUtil;
    private _logUtil: LoggingUtil;
    private _hullClient: IHullClient;

    /**
     * Creates an instance of MailjetEventUtil.
     * @param {IHullClient} hullClient The Hull Client.
     * @param {MappingUtil} mappingUtil The mapping utility.
     * @param {LoggingUtil} logUtil The logging utility.
     * @memberof MailjetEventUtil
     */
    constructor(hullClient: IHullClient, mappingUtil: MappingUtil, logUtil: LoggingUtil) {
        this._hullClient = hullClient;
        this._logUtil = logUtil;
        this._mappingUtil = mappingUtil;
    }
    
    /**
     * Process the given Mailjet Event.
     *
     * @param {IMailjetEvent} mjEvent The Mailjet Event.
     * @returns {Promise<void>}
     * @memberof MailjetEventUtil
     */
    public async processEvent(mjEvent: IMailjetEvent): Promise<void> {
        let userIdent: IHullUserClaims | undefined;
        let hullEvent: IHullUserEvent | undefined;
        try {
            this.ensureKnownEvent(mjEvent); // Make sure we can handle the event
            userIdent = this._mappingUtil.mapMailjetEventToHullUserIdent(mjEvent);
            hullEvent = this._mappingUtil.mapMailjetEventToHullEvent(mjEvent);

            if (mjEvent.mj_contact_id === 0) { // Handle test events
                this._logUtil.logConnectorOperation("log", "incoming.event.test", { ident: userIdent, event: hullEvent });
                return;
            }

            await this._hullClient.asUser(userIdent).track(
                hullEvent.event, 
                hullEvent.properties, 
                _.merge({}, hullEvent.context, {
                    created_at: hullEvent.created_at,
                    source: "mailjet"
                }));

            this._logUtil.logConnectorOperation("debug", "incoming.event.success", { event: hullEvent }, userIdent);   

        } catch (error) {
            const sanitizedError = _.omit(error, ["stack"]);
            this._logUtil.logConnectorOperation("error", "incoming.event.error", { error: sanitizedError, event: hullEvent }, userIdent);
        }
    }

    private ensureKnownEvent(mjEvent: IMailjetEvent): void {
        if (_.includes(_.keys(MJ_EVENT_MAPPING), mjEvent.event) === false) {
            throw new UnknownMailjetEventError(mjEvent, ERROR_INCOMING_EVENT_UNKNOWN);
        }
    }
}

export default MailjetEventUtil;