import _ from "lodash";

import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";
import IHullClient from "../types/hull-client";
import IPrivateSettings from "../types/private-settings";
import MailjetClient from "./mailjet-client";
import IMailjetClientConfig from "./mailjet-client-config";
import { IMailjetPagedResult, IMailjetContactProperty, IMailjetContactList } from "./mailjet-objects";
import FilterUtil from "../utils/filter-util";

class SyncAgent {

    private _hullClient: IHullClient;
    private _metricsClient: any;
    private _connector: any;
    private _svcClientConfig: IMailjetClientConfig;
    private _svcClient: MailjetClient;
    private _filterUtil: FilterUtil;

    constructor(client: IHullClient, connector: any, metricsClient: any) {
        // Destructure hull clients
        this._hullClient = client;
        this._metricsClient = metricsClient;
        this._connector = connector;
        // Obtain the private settings from the connector and run some basic checks
        const privateSettings: IPrivateSettings = _.get(connector, "private_settings") as IPrivateSettings;
        
        // Configure the Mailjet Client
        this._svcClientConfig = {
            apiKey: privateSettings.api_key || "",
            apiSecretKey: privateSettings.api_secret_key || ""
        }
        this._svcClient = new MailjetClient(this._svcClientConfig);
        // Configure the utilities
        this._filterUtil = new FilterUtil(privateSettings);
    }

    public async sendUserMessages(messages: IHullUserUpdateMessage[], isBatch: boolean = false): Promise<any> {
        // [STEP 1] Filter messages
        const filteredEnvelopes = this._filterUtil.filterUserMessages(messages, isBatch);
        const envelopesToSkip = _.filter(filteredEnvelopes, (envelope) => {
            return envelope.operation === "skip";
        });
        const enevelopesToProcess = _.filter(filteredEnvelopes, (envelope) => {
            return envelope.operation !== "skip";
        });

        _.forEach(envelopesToSkip, (envelope) => {
            const userIdent = _.pick(_.get(envelope, "msg.user"), ["id", "external_id", "email"]);
            this._hullClient.asUser(userIdent)
                .logger
                .debug("outgoing.user.skip", { reason: envelope.reason });
        });

        if (enevelopesToProcess.length === 0) {
            return Promise.resolve(true);
        }
        // [STEP 2] Transform Hull objects into Planhat objects

        // [STEP 3] Execute API calls
    }

    public async sendAccountMessages(messages: IHullAccountUpdateMessage[], isBatch: boolean = false): Promise<any> {
        return Promise.resolve(true);
    }

    public async getMetadataContactProperties(): Promise<IMailjetContactProperty[]> {
        let hasMore = true;
        let offset = 0;
        const limit = 100;
        const result: IMailjetContactProperty[] = [];
        
        while (hasMore === true) {
            this._metricsClient.increment("ship.service_api.call", 1);
            const apiResult = await this._svcClient.getMetadataContactProperties(offset, limit);
            hasMore = (apiResult.data as IMailjetPagedResult<IMailjetContactProperty>).Count === limit;
            offset += limit;
            result.push(...(apiResult.data as IMailjetPagedResult<IMailjetContactProperty>).Data);
        }
        
        return result;
    }

    public async getContactLists(): Promise<IMailjetContactList[]> {
        let hasMore = true;
        let offset = 0;
        const limit = 100;
        const result: IMailjetContactList[] = [];

        while (hasMore === true) {
            this._metricsClient.increment("ship.service_api.call", 1);
            const apiResult = await this._svcClient.getContactLists(offset, limit);
            hasMore = (apiResult.data as IMailjetPagedResult<IMailjetContactList>).Count === limit;
            offset += limit;
            result.push(...(apiResult.data as IMailjetPagedResult<IMailjetContactList>).Data);
        }
        
        return result;
    }

    public isAuthNConfigured() {
        return this._svcClientConfig.apiKey !== "" &&
                this._svcClientConfig.apiSecretKey !== "";
    }
}

export default SyncAgent;