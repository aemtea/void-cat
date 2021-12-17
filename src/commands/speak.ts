
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Strings } from "../strings";
import { VoidInteractionUtils } from "../utils/voidInteractionUtils";

export const data = new SlashCommandBuilder()
    .setName(Strings.Speak.Name)
    .setDescription(Strings.Speak.Description)
    .addStringOption(option =>
        option.setName(Strings.Speak.Incancation.Name)
            .setDescription(Strings.Speak.Incancation.Description)
            .setRequired(true));

export const execute = async (interaction: CommandInteraction) => {
    try {
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.General.NoPermission);
            return;
        }

        var voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

        if (!voidChannel) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Speak.NoVoid);
            return;
        }
        await interaction.deferReply();
        var incantation = getIncantation(interaction);

        await voidChannel.send(incantation!);
        await interaction.editReply(Strings.Speak.RepeatIncanation(incantation));
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Speak.Error);
        console.log(err);
    }
}

const getIncantation = (interaction: CommandInteraction): string => {
    return interaction.options.getString(Strings.Speak.Incancation.Name, true);
}