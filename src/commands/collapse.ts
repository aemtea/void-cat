import util from 'util';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionReplyOptions, ThreadChannel } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';

dotenv.config();
const wait = util.promisify(setTimeout);

const theVoidString = 'the-void';
const token: string = process.env.TOKEN!;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collapse')
        .setDescription('Collapses the void into nothingness.'),
    async execute(interaction: CommandInteraction) {
        const rest = new REST({ version: '9' }).setToken(token);
        const theVoid = interaction.guild?.channels.cache.find(x => x.name === theVoidString);

        if (!theVoid) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'There is no void to collapse.',
                ephemeral: true
            });
            return;
        }
        const beginRumbling = 'The void begins to rumble...';
        await interaction.reply(<InteractionReplyOptions>{
            content: beginRumbling,
            ephemeral: true
        });
        (<ThreadChannel>theVoid).send(beginRumbling);
        await wait(10000);

        const rumblingIntensifies = 'Rumbling intensifies...';
        await interaction.followUp(<InteractionReplyOptions>{
            content: rumblingIntensifies,
            ephemeral: true
        });
        (<ThreadChannel>theVoid).send(rumblingIntensifies);
        await wait(10000);

        try {
            await rest.delete(Routes.channel(theVoid.id));

            if (interaction.channelId != theVoid.id) {
                await interaction.followUp(<InteractionReplyOptions>{
                    content: 'The void vanishes without a trace.',
                    ephemeral: true
                });
            }
        } catch (err) {
            await interaction.followUp('The void stabilizes unexpectedly.');
            console.log(err);
        }
    },
};