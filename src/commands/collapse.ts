import util from 'util';
import dotenv from 'dotenv';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

dotenv.config();
const wait = util.promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collapse')
        .setDescription('Collapses the void into nothingness.'),
    async execute(interaction: CommandInteraction) {
        try {
            var theVoid = VoidInteractionUtils.getVoidChannel(interaction);

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
            await theVoid.send(beginRumbling);
            await wait(10000);

            const rumblingIntensifies = 'Rumbling intensifies...';
            await interaction.followUp(<InteractionReplyOptions>{
                content: rumblingIntensifies,
                ephemeral: true
            });
            await theVoid.send(rumblingIntensifies);
            await wait(10000);

            await theVoid.delete();

            if (interaction.channelId != theVoid.id) {
                await interaction.followUp(<InteractionReplyOptions>{
                    content: 'The void vanishes without a trace.',
                    ephemeral: true
                });
            }
        } catch (err) {
            await interaction.followUp(<InteractionReplyOptions>{
                content: 'The void stabilizes unexpectedly.',
                ephemeral: true
            });
            console.log(err);
        }
    },
};