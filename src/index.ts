import express from "express";
import Hull from "hull";
import server from "./server";


if (process.env.LOG_LEVEL) {
    (Hull.logger.transports as any).console.level = process.env.LOG_LEVEL;
}

const config = {
    hostSecret: process.env.SECRET || "SECRET",
    port: process.env.PORT || 8094,
    timeout: process.env.CLIENT_TIMEOUT || "25s"
};

const connector = new Hull.Connector(config);
const app = express();

connector.setupApp(app);

server(app);
connector.startApp(app);