import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';
import { Strings } from '../strings';
import * as CollapseManager from '../collapseManager';

export const data = new SlashCommandBuilder()
    .setName(Strings.Stabilize.Name)
    .setDescription(Strings.Stabilize.Description);

export const execute = async (interaction: CommandInteraction) => {
    try {
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.General.NoPermission);
            return;
        }

        const voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

        if (!voidChannel) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Stabilize.NoVoid);
            return;
        }

        if (!CollapseManager.isCollapseInProgress(interaction.channelId)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Stabilize.NoCollapse);
            return;
        }

        await interaction.deferReply();

        CollapseManager.stabilize(interaction.channelId);
        await interaction.editReply(Strings.Stabilize.Stabilized);
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Stabilize.Error);
        console.log(err);
    }
}