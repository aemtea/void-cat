
import { SlashCommandBuilder } from "@discordjs/builders";
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
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, 'You don\'t have permissions to do that. Sorry!');
            return;
        }

        var theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (!theVoid) {
            await VoidInteractionUtils.privateReply(interaction, 'There is no void to speak through.');
            return;
        }
        await interaction.deferReply();
        var incantation = getIncantation(interaction);

        await theVoid.send(incantation!);
        await interaction.editReply(`Void Cat repeats your incantation: "${incantation}"`);
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, 'The void refuses your incantation.');
        console.log(err);
    }
}

const getIncantation = (interaction: CommandInteraction): string | null=> {
    return interaction.options.getString('incantation');
}