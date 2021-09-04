import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';

dotenv.config();

const token: string = process.env.TOKEN!;
const clientId: string = process.env.CLIENT_ID!;
const guildId: string = process.env.GUILD_ID!;

const commands = [
	new SlashCommandBuilder().setName('collapse').setDescription('Collapses the void into nothingness.')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();