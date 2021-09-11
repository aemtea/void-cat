import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

export const data = new SlashCommandBuilder()
    .setName('initialize')
    .setDescription('Reaches into the nothingness and returns with the void.');

export const execute = async (interaction: CommandInteraction) => {
    try {
        const theVoid = VoidInteractionUtils.getVoidChannel(interaction);
        const initializeString = 'You stare into the void. The void stares back at you.';

        if (theVoid) {
            await interaction.reply(<InteractionReplyOptions>{
                content: initializeString,
                ephemeral: true
            });
            return;
        }

        await interaction.deferReply(<InteractionDeferReplyOptions>{
            ephemeral: true
        });

        await VoidInteractionUtils.createVoidChannel(interaction);

        await interaction.editReply(<InteractionReplyOptions>{
            content: initializeString,
            ephemeral: true
        });
    } catch (err) {
        await interaction.followUp(<InteractionReplyOptions>{
            content: 'You call out to the void and hear nothing in return.',
            ephemeral: true
        });
        console.log(err);
    }
}