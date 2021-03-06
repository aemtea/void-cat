import { CommandInteraction, InteractionReplyOptions } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';
import { Strings } from '../strings';
import * as CollapseManager from '../collapseManager';

export const data = new SlashCommandBuilder()
    .setName(Strings.Stabilize.Name)
    .setDescription(Strings.Stabilize.Description)
    .setDefaultPermission(false);

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

        if (!CollapseManager.isCollapseInProgress(voidChannel.id)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Stabilize.NoCollapse);
            return;
        }

        const collapse = CollapseManager.getCollapseInProgress(voidChannel.id);
        CollapseManager.stabilize(collapse.voidChannelId);

        await interaction.reply(Strings.Stabilize.Stabilized);        
        await collapse.interaction.followUp(<InteractionReplyOptions>{
            content: Strings.Collapse.Later.StabilizedBy(interaction.user),
            ephemeral: true
        });
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Stabilize.Error);
        console.log(err);
    }
}