import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, InteractionDeferReplyOptions, InteractionReplyOptions, Permissions } from "discord.js";
import { VoidInteractionUtils } from "../utils/voidInteractionUtils";

export const data = new SlashCommandBuilder()
    .setName('speak')
    .setDescription('Speak through the Void Cat.')
    .addStringOption(option =>
        option.setName('incantation')
            .setDescription('The incantation to speak.')
            .setRequired(true));

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

        var theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (!theVoid) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'There is no void to speak through.',
                ephemeral: true
            });
            return;
        }
        await interaction.deferReply();
        var incantation = interaction.options.getString('incantation');

        await theVoid.send(incantation!);
        await interaction.editReply(`Void Cat repeats your incantation: "${incantation}"`);
    } catch (err) {
        await interaction.editReply(<InteractionReplyOptions>{
            content: 'The void refuses your incantation.',
            ephemeral: true
        });
        console.log(err);
    }
}