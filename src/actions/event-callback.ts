import _ from "lodash";
import { Request, Response } from "express";
import IHullClient from "../types/hull-client";
import SyncAgent from "../core/sync-agent";

const eventCallbackAction = async (req: Request, res: Response) => {
    if (_.get(req, "hull", undefined) === undefined) {
        res.status(400).send({ message: "Insufficient data to route request to proper organization." });
        return Promise.resolve(false);
    }

    try {
        // Destructure the hull object from request
        const client: IHullClient = (req as any).hull.client;
        const connector: any = (req as any).hull.ship;
        const metric: any = (req as any).hull.metric;
        const agent = new SyncAgent(client, connector, metric);
        // TODO: Call the 
        const isSuccess = await agent.handleEventCallbacks(req.body);
        
        // If everything goes well, just return status 200
        if (isSuccess === true) {
            res.status(200).send({ message: "Incoming message accepted." });
            return Promise.resolve(true);
        } else {
            res.status(500).send({ message: "Unknown error." });
            return Promise.resolve(false);
        }
    } catch (error) {
        // TODO: Maybe we should log this error here?
        res.status(500).send({ message: "Unknown error." });
        return Promise.resolve(false);        
    }
    
}

export default eventCallbackAction;