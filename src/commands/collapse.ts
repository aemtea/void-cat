import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collapse')
		.setDescription('Collapses the void into nothingness.'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('The void begins to rumble...');
	},
};