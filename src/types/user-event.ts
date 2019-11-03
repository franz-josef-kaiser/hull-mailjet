import { StringLiteral } from "babel-types";

export interface IHullUserEventProps {
    [propName: string]: string;
}

export interface IHullUserEventContext {
    location?: any;
    page?: {
        referrer?: string;
    }
    referrer?: {
        url: string;
    }
    os?: any;
    useragent?: string;
    ip?: string | number;
}

export default interface IHullUserEvent {
    id?: string;
    event_id?: string;
    event: string;
    created_at: string;
    event_source?: string;
    event_type?: string;
    track_id?: string;
    user_id?: string;
    anonymous_id?: string;
    session_id?: string;
    ship_id?: string;
    app_id?: string;
    app_name?: string;
    context: IHullUserEventContext;
    properties: IHullUserEventProps;
};
