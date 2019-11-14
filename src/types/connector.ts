import IPrivateSettings from "./private-settings";

export interface IHullConnectorConfig {
    id: string;
    organization: string;
    secret: string;
}

export interface IHullConnectorSubscriptionConditions {
    [propName: string]: any;
}

export interface IHullConnectorSubscriptionChannel {
    channel: string;
    handler: string;
}

export interface IHullConnectorBatchSubscription {
    url: string;
    channels?: IHullConnectorSubscriptionChannel[];
}

export interface IHullConnectorSubscription extends IHullConnectorBatchSubscription {
    conditions?: IHullConnectorSubscriptionConditions;
}

export interface IHullConnectorStatusEndpoint {
    url: string;
    type: "interval" | "cron";
    value: string;
    method?: "all" | "get" | "post";
    handler?: string;
}

export interface IHullConnectorScheduleEndpointOptions {
    [propName: string]: any;
}

export interface IHullConnectorScheduleEndpoint {
    url: string;
    type: "interval" | "cron";
    value: string;
    handler?: string;
    options?: IHullConnectorScheduleEndpointOptions;
}

export interface IHullConnectorSettingSection {
    title: string;
    step?: string;
    description?: string;
    properties: string[];
}

export interface IHullConnectorStatus {
    status: "ok" | "warn" | "error" | "setupRequired";
    messages: string[];
    updated_at?: string;
    name?: string;
    id?: string;
}

export interface IHullConnectorManifest {
    description: string;
    tags?: string[];
    private_settings: IPrivateSettings;
    tabs?: any[];
    name: string;
    settings?: any;
    subscriptions: IHullConnectorSubscription[];
    ui?: boolean;
    readme: string;
    batches?: IHullConnectorBatchSubscription[];
    statuses: IHullConnectorStatusEndpoint[];
    schedules: IHullConnectorScheduleEndpoint[];
    version: string;
    settings_sections: IHullConnectorSettingSection[];
    [propName: string]: any;
}

export interface IHullConnector {
    description: string;
    manual_mode?: boolean;
    tags?: string[];
    transfer_exports?: boolean;
    accept_incoming_webhooks?: boolean;
    source_url: string;
    private_settings: IPrivateSettings;
    index: string;
    name: string;
    transfer_notifications?: boolean;
    extra?: any;
    settings?: any;
    type: string;
    manifest: IHullConnectorManifest;
    secret: string;
    updated_at?: string;
    status?: IHullConnectorStatus;
    id: string;
    picture?: any;
    homepage_url?: string;
    manifest_url: string;
    poll_scheduled_calls?: boolean;
    created_at: string;
    [propName: string]: any;
}