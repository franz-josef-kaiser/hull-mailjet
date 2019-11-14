import IHullShipUpdateMessage from "../types/ship-update-message";
import SyncAgent from "../core/sync-agent";

const connectorUpdateAction = async(ctx: any, _messages: IHullShipUpdateMessage[]): Promise<any> => {
    try {
        const agent = new SyncAgent(ctx.client, ctx.ship, ctx.metric);
        await agent.ensureEventCallbackUrls();
        return {
            flow_control: { type: "next", size: 10, in_time: 10, in: 5 }
        };
    } catch (error) {
        throw error;
    }
}

export default connectorUpdateAction;