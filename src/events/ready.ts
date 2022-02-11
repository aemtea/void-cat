import { Client } from "discord.js";
import { CollapseWorker } from "../collapseWorker";

// When the client is ready, run this code (only once)
module.exports = {
    name: 'ready',
    once: true,
    execute(client: Client) {
        console.log(`Ready! Logged in as ${(<any>client).user.tag}`);

        var collapseWorker = new CollapseWorker();

        collapseWorker.doWork();
    },
};