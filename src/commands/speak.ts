import util from 'util';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions } from "discord.js";
import { VoidInteractionUtils } from "../utils/voidInteractionUtils";

const wait = util.promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('speak')
        .setDescription('Speak through the Void Cat.')
        .addStringOption(option =>
            option.setName('incantation')
                .setDescription('The incantation to speak.')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        try {
            var theVoid = VoidInteractionUtils.getVoidChannel(interaction);

            if (!theVoid) {
                await interaction.reply(<InteractionReplyOptions>{
                    content: 'There is no void to speak through.',
                    ephemeral: true
                });
                return;
            }
            await interaction.deferReply(<InteractionDeferReplyOptions>{
                ephemeral: true
            });
            var incantation = interaction.options.getString('incantation');

            await theVoid.send(incantation!);

            await interaction.editReply(<InteractionReplyOptions>{
                content: 'Your incantation has been spoken.',
                ephemeral: true
            });
        } catch (err) {
            await interaction.editReply(<InteractionReplyOptions>{
                content: 'The void refuses your incantation.',
                ephemeral: true
            });
            console.log(err);
        }
    },
};