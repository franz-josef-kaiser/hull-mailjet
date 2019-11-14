import { IHullConnectorManifest } from "./connector";

export default interface IHullShipUpdateMessage {
    description: string;
    manual_mode?: boolean;
    tags?: string[];
    transfer_exports?: boolean;
    accept_incoming_webhooks?: boolean;
    source_url: string;
    index: string;
    name: string;
    transfer_notifications?: boolean;
    extra?: any;
    settings?: any;
    type: string;
    manifest: IHullConnectorManifest;
    updated_at?: string;
    id: string;
    picture?: any;
    homepage_url?: string;
    manifest_url: string;
    poll_scheduled_calls?: boolean;
    created_at: string;
    [propName: string]: any;
    updated_id: string;
    message_id: string;
}