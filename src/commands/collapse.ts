import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Channel, Collection, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, InteractionReplyOptions, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';
import { Strings } from '../strings';
import * as CollapseManager from '../collapseManager';

export const data = new SlashCommandBuilder()
    .setName(Strings.Collapse.Name)
    .setDescription(Strings.Collapse.Description)
    .addSubcommand(subcommand =>
        subcommand.setName(Strings.Collapse.Later.Name)
            .setDescription(Strings.Collapse.Later.Description)
            .addIntegerOption(option =>
                option.setName(Strings.Collapse.Later.Minutes.Name)
                    .setDescription(Strings.Collapse.Later.Minutes.Description)
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName(Strings.Collapse.Smother.Name)
                    .setDescription(Strings.Collapse.Smother.Description)
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand.setName(Strings.Collapse.Info.Name)
            .setDescription(Strings.Collapse.Info.Description))
    .addSubcommand(subcommand =>
        subcommand.setName(Strings.Collapse.Now.Name)
            .setDescription(Strings.Collapse.Now.Description)
            .addBooleanOption(option =>
                option.setName(Strings.Collapse.Smother.Name)
                    .setDescription(Strings.Collapse.Smother.Description)
                    .setRequired(false)))

export const execute = async (interaction: CommandInteraction) => {

    try {
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.General.NoPermission);
            return;
        }
        const voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

        if (isCollapseInfo(interaction)) {
            await collapseInfo(interaction, voidChannel);
            return;
        }

        if (CollapseManager.isCollapseInProgress(interaction.channelId)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.CollapseInProgress);
            return;
        }

        if (!voidChannel) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.NoVoid);
            return;
        }
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.Info.Error);
        console.log(err);
        return;
    }

    try {
        if (isCollapseNow(interaction)) {
            await collapseNow(interaction);
        } else if (isCollapseLater(interaction)) {
            await collapseLater(interaction);
        }
    } catch (err) {
        await interaction.followUp(Strings.Collapse.Error);
        console.log(err);
    }
}

const collapseInfo = async (interaction: CommandInteraction, voidChannel: Channel | null): Promise<void> => {
    let collapse;
    if (voidChannel) {
        collapse = CollapseManager.getCollapseInProgress(voidChannel.id);
    }

    if (!voidChannel || !collapse) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.Info.NoCollapse);
        return;
    }

    const minutesUntilCollapse = collapse.getMinutesUntilColapse();
    await interaction.reply(Strings.Collapse.Info.MinutesRemaining(minutesUntilCollapse));
    return;
}

const collapseNow = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply(<InteractionDeferReplyOptions>{
        ephemeral: true
    });

    const buttons = getCollapseNowButtons();

    await interaction.editReply(<InteractionReplyOptions>{
        content: Strings.Collapse.Now.Confirm,
        ephemeral: true,
        components: [buttons]
    });

    const filter = (componentInteraction: MessageComponentInteraction) => componentInteraction.user.id === interaction.user.id;
    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 15000 });

    // Executed after button click
    collector?.on('collect', async (componentInteraction: MessageComponentInteraction) => {
        if (componentInteraction.customId === Strings.Collapse.Now.ConfirmId) {
            await componentInteraction.update(<InteractionDeferUpdateOptions>{ content: Strings.Collapse.Now.Collapsing, components: [] });
            const voidChannel = VoidInteractionUtils.getVoidChannel(interaction);
            await voidChannel?.delete();

            if (shouldSmother(interaction)) {
                if (interaction.channelId != voidChannel?.id) {
                    await componentInteraction.followUp(Strings.Collapse.Now.CollapsedBySmother(interaction.user));
                }
            } else {
                if (interaction.channelId != voidChannel?.id) {
                    await VoidInteractionUtils.createVoidChannel(interaction);
                    await componentInteraction.followUp(Strings.Collapse.Now.CollapsedBy(interaction.user));
                }
            }
        } else if (componentInteraction.customId === Strings.Collapse.Now.CancelId) {
            await componentInteraction.update(<InteractionDeferUpdateOptions>{ content: Strings.Collapse.Now.Cancelled, components: [] });
        }
    });

    collector?.on('end', (collected: Collection<string, ButtonInteraction>) => console.log(`Collectoed ${collected.size} items`));
}

const collapseLater = async (interaction: CommandInteraction): Promise<void> => {
    const minutesInput = getMinutesInput(interaction);

    if (minutesInput < 1) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.Later.Minutes.LessThanOne);
        return;
    }

    const voidChannel = VoidInteractionUtils.getVoidChannel(interaction);
    const beginRumbling = Strings.Collapse.Later.BeginCollapse(minutesInput);

    await interaction.reply(beginRumbling);
    await voidChannel?.send(beginRumbling);

    CollapseManager.beginCollapse(voidChannel?.id!, interaction, minutesInput, shouldSmother(interaction));
}

const isCollapseInfo = (interaction: CommandInteraction) => {
    return interaction.options.getSubcommand() === Strings.Collapse.Info.Name;
}

const isCollapseNow = (interaction: CommandInteraction) => {
    return interaction.options.getSubcommand() === Strings.Collapse.Now.Name;
}

const isCollapseLater = (interaction: CommandInteraction) => {
    return interaction.options.getSubcommand() === Strings.Collapse.Later.Name;
}

const getCollapseNowButtons = (): MessageActionRow => {
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(Strings.Collapse.Now.CancelId)
                .setLabel(Strings.Collapse.Now.CancelLabel)
                .setStyle(2) //SECONDARY
        )
        .addComponents(
            new MessageButton()
                .setCustomId(Strings.Collapse.Now.ConfirmId)
                .setLabel(Strings.Collapse.Now.ConfirmLabel)
                .setStyle(4) //DANGER
        );
}

const getMinutesInput = (interaction: CommandInteraction): number => {
    return interaction.options.getInteger(Strings.Collapse.Later.Minutes.Name, true);
}

const shouldSmother = (interaction: CommandInteraction): boolean => {
    var shouldSmother = interaction.options.getBoolean(Strings.Collapse.Smother.Name);
    return shouldSmother != null ? shouldSmother : false;
}