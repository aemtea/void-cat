import { Interaction } from "discord.js";

// Listen for commands
module.exports = {
    name: 'interactionCreate',
    async execute(interaction: Interaction) {
        if (!interaction.isCommand() && !interaction.isContextMenu()) return;

        const command = (<any>interaction.client).commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};