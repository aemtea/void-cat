import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Strings } from '../strings';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

export const data = new SlashCommandBuilder()
    .setName(Strings.Initialize.Name)
    .setDescription(Strings.Initialize.Description);

export const execute = async (interaction: CommandInteraction) => {
    try {
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.General.NoPermission);
            return;
        }

        const voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

        if (voidChannel) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Initialize.VoidExists);
            return;
        }

        await VoidInteractionUtils.createVoidChannel(interaction);

        await interaction.reply(Strings.Initialize.VoidCreated);
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Initialize.Error);
        console.log(err);
    }
}

