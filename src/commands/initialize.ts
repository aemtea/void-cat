import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions, Permissions } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

export const data = new SlashCommandBuilder()
    .setName('initialize')
    .setDescription('Reaches into the nothingness and returns with the void.');

export const execute = async (interaction: CommandInteraction) => {
    try {
        const permissions = new Permissions((<Permissions>interaction.member?.permissions));
        if (!permissions.has('MANAGE_CHANNELS')) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'You don\'t have permissions to do that. Sorry!',
                ephemeral: true
            });
            return;
        }

        const theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (theVoid) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'Void already exists.',
                ephemeral: true
            });
            return;
        }

        await VoidInteractionUtils.createVoidChannel(interaction);

        await interaction.reply('You stare into the void. The void stares back at you.');
    } catch (err) {
        await interaction.reply(<InteractionReplyOptions>{
            content: 'You call out to the void and hear nothing in return.',
            ephemeral: true
        });
        console.log(err);
    }
}