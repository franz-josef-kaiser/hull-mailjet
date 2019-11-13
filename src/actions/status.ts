import _ from "lodash";
import { Request, Response } from "express";
import IHullClient from "../types/hull-client";
import SyncAgent from "../core/sync-agent";

const statusAction = async (req: Request, res: Response) => {
    // Destructure the hull object from request
    const client: IHullClient = (req as any).hull.client;
    const connector: any = (req as any).hull.ship;
    const metric: any = (req as any).hull.metric;
    const agent = new SyncAgent(client, connector, metric);
    // Obtain the status from sync-agent
    const status = await agent.determineConnectorStatus();
    res.json(status);
}

export default statusAction;