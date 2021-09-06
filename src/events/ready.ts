import { Client } from "discord.js";

// When the client is ready, run this code (only once)
module.exports = {
    name: 'ready',
    once: true,
    execute(client: Client) {
        console.log(`Ready! Logged in as ${(<any>client).user.tag}`);
    },
};