// Require the necessary discord.js classes
import path from 'path';
import fs from 'fs';
import { Client, Collection, Intents } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import dotenv from 'dotenv';

dotenv.config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//TODO replace anys with types
(<any>client).commands = new Collection();
const commandsPath = path.resolve(__dirname,'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	(<any>client).commands.set((<any>command).data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Listen for commands
client.on('interactionCreate', async (interaction): Promise<void> => {
	if (!interaction.isCommand()) return;

	const command = (<any>client).commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with your client's token
client.login(process.env.TOKEN).then(() => {
    console.log('Logged in!')
}).catch((err) => {
    console.log(err)
});