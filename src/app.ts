// Require the necessary discord.js classes
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import EventEmitter from 'events';
import { Client, Collection, Intents } from 'discord.js';

dotenv.config();
const eventEmitter = new EventEmitter();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const eventsPath = path.resolve(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(eventEmitter, ...args));
    }
}

//TODO replace anys with types
(<any>client).commands = new Collection();
const commandsPath = path.resolve(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    (<any>client).commands.set((<any>command).data.name, command);
}

// Login to Discord with your client's token
client.login(process.env.TOKEN).catch((err) => {
    console.log(err)
});