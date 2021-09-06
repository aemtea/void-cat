import dotenv from 'dotenv';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions } from 'discord.js';

dotenv.config();

const theVoidString = 'the-void';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('initialize')
        .setDescription('Reaches into the nothingness and returns with the void.'),
    async execute(interaction: CommandInteraction) {
        const theVoid = interaction.guild?.channels.cache.find(x => x.name === theVoidString);
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
        
        try {
            interaction.guild?.channels.create(theVoidString);
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
};