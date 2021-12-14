import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions, Permissions } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

export const data = new SlashCommandBuilder()
    .setName('initialize')
    .setDescription('Reaches into the nothingness and returns with the void.');

export const execute = async (interaction: CommandInteraction) => {
    try {
        const permissions = new Permissions((<Permissions>interaction.member?.permissions));
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, 'You don\'t have permissions to do that. Sorry!');
            return;
        }

        const theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (theVoid) {
            await VoidInteractionUtils.privateReply(interaction, 'Void already exists.');
            return;
        }

        await VoidInteractionUtils.createVoidChannel(interaction);

        await interaction.reply('You stare into the void. The void stares back at you.');
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, 'You call out to the void and hear nothing in return.');
        console.log(err);
    }
}

