import _ from "lodash";
import { Request, Response } from "express";
import IHullClient from "../types/hull-client";
import SyncAgent from "../core/sync-agent";

const eventcallbacksClearAction = async (req: Request, res: Response) => {
    // Destructure the hull object from request
    const client: IHullClient = (req as any).hull.client;
    const connector: any = (req as any).hull.ship;
    const metric: any = (req as any).hull.metric;
    const agent = new SyncAgent(client, connector, metric);
    if (_.get(connector, "homepage_url", undefined) === undefined &&
            _.get(req, "query.organization", undefined) !== undefined) {
            connector.homepage_url = `https://${req.query.organization}/ships/${connector.id}`;
    }
    // Ensure that the callbacks are properly registered.
    await agent.clearEventCallbackUrls();
    res.json({ message: "Ensured event event callback URLs are unregistered." });
}

export default eventcallbacksClearAction;