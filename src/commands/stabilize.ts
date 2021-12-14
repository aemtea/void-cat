import EventEmitter from 'events';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions, Permissions } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

export const data = new SlashCommandBuilder()
    .setName('stabilize')
    .setDescription('Stabilizes the void if the void is currently collapsing.');

export const execute = async (interaction: CommandInteraction, eventEmitter: EventEmitter) => {
    try {
        const permissions = new Permissions((<Permissions>interaction.member?.permissions));
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, 'You don\'t have permissions to do that. Sorry!');
            return;
        }

        const theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (!theVoid) {
            await VoidInteractionUtils.privateReply(interaction, 'There is no void to stabilize.');
            return;
        }

        if (eventEmitter.listenerCount('stabilize') === 0) {
            await VoidInteractionUtils.privateReply(interaction, 'No collapse in progress.');
            return;
        }

        await interaction.deferReply();

        eventEmitter.emit('stabilize', interaction, async (interaction: CommandInteraction) => {
            await interaction.editReply('The void stabilizes.');
        });
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, 'Void failed to stabilize.');
        console.log(err);
    }
}