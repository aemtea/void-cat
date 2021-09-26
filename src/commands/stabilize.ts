import EventEmitter from 'events';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions, Permissions } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('stabilize')
    .setDescription('Stabilizes the void if the void is currently collapsing.');

export const execute = async (interaction: CommandInteraction, eventEmitter: EventEmitter) => {
    try {
        const permissions = new Permissions((<Permissions>interaction.member?.permissions));
        if (!permissions.has('MANAGE_CHANNELS')) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'You don\'t have permissions to do that. Sorry!',
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply();

        eventEmitter.emit('stabilize', interaction, async (interaction: CommandInteraction) => {
            await interaction.editReply('The void stabilizes.');
        });
    } catch (err) {
        await interaction.editReply(<InteractionReplyOptions>{
            content: 'Void failed to stabilize.',
            ephemeral: true
        });
        console.log(err);
    }
}