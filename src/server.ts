import _ from "lodash";
import express, { Application, RequestHandler } from "express";
import cors from "cors";
import { smartNotifierHandler } from "hull/lib/utils";
import actions from "./actions";
import * as basicAuth from 'express-basic-auth'
import { ParamsDictionary } from "express-serve-static-core";
import authMiddleware from "./utils/auth-middleware";

const server = (app: Application): Application => {
    // Hull platform handler endpoints
    app.post("/smart-notifier", smartNotifierHandler({
        handlers: {
            "user:update": actions.userUpdate({
                flowControl: {
                    type: "next",
                    size: parseInt(_.get(process.env.FLOW_CONTROL_SIZE, "200"), 10),
                    in: parseInt(_.get(process.env.FLOW_CONTROL_IN, "5"), 10),
                    in_time: parseInt(_.get(process.env.FLOW_CONTROL_IN_TIME, "60000"), 10)
                  }
            }),
            "ship:update": actions.connectorUpdate
        }
    }));

    app.use("/batch", smartNotifierHandler({
        userHandlerOptions: {
          groupTraits: false
        },
        handlers: {
          "user:update": actions.userUpdate({ isBatch: true})
        }
      }));

    // CORS enabled endpoints for manifest.json
    app.get("/metadata/(:type)", cors(), actions.metadata);

    // Status endpoint
    app.use("/status", actions.status);

    // Schedule endpoints
    app.use("/schedulewebhooks", actions.scheduleWebhooks);

    // Button endpoints
    app.use("/eventcallbacksclear", cors(), actions.eventcallbacksClear);

    // The event callback URL handler (aka webhook)
    app.use(express.json());
    app.use("/eventcallback", cors(), authMiddleware , actions.eventCallback);

    return app;
}

export default server;
