// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

// Listen for commands
client.on('interactionCreate', async (interaction): Promise<void> => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'collapse') {
		await interaction.reply('The void begins to rumble...');
	}
});

// Login to Discord with your client's token
client.login(process.env.TOKEN).then(() => {
    console.log('Logged in!')
}).catch((err) => {
    console.log(err)
});