import _ from "lodash";
import { Request, Response } from "express";
import IFieldsSchema from "../types/fields-schema";
import IHullClient from "../types/hull-client";
import SyncAgent from "../core/sync-agent";
import { MJ_ATTRIBUTE_DEFAULT_NAME, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS } from "../core/constants";

const metadataAction = async (req: Request, res: Response) => {
    // Destructure the hull object from request
    const client: IHullClient = (req as any).hull.client;
    const connector: any = (req as any).hull.ship;
    const metric: any = (req as any).hull.metric;
    const cache: any = (req as any).hull.cache;
    const agent = new SyncAgent(client, connector, metric);

    const type: string = _.get(req, "params.type", "unknown");
    const payload: IFieldsSchema = {
        ok: false,
        error: null,
        options: []
    };
    switch (type) {
        case "contactproperties":
            payload.options = await cache.wrap(type, async () => {
                const mjProps = await agent.getMetadataContactProperties();
                return mjProps.map((p) => {
                    return { value: p.Name, label: p.Name };
                });
            });
            // Always add the default props
            payload.options.push({ value: "Name", label: MJ_ATTRIBUTE_DEFAULT_NAME });
            payload.options.push({ value: "IsExcludedFromCampaigns", label: MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS });
            payload.ok = true;
            break;
        case "contactlists":
            payload.options = await cache.wrap(type, async () => {
                const mjLists = await agent.getContactLists();
                return mjLists.map((p) => {
                    return { value: p.ID, label: p.Name };
                });
            });
            break;
        default:
            payload.error = `Unrecognized type: "${type}"`;
            break;
    }

    return res.json(payload);
};

export default metadataAction;