import util from 'util';
import EventEmitter from 'events';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Collection, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, InteractionReplyOptions, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';
import { Strings } from '../strings';

const wait = util.promisify(setTimeout);

let collapseDate: Date | null = null;

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

export const execute = async (interaction: CommandInteraction, eventEmitter: EventEmitter) => {

    try {
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, Strings.General.NoPermission);
            return;
        }
        if (isCollapseInfo(interaction)) {
            await collapseInfo(interaction);
            return;
        }

        if (collapseDate) {
            await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.CollapseInProgress);
            return;
        }

        let voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

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
            await collapseLater(interaction, eventEmitter);
        }
    } catch (err) {
        await interaction.followUp(Strings.Collapse.Error);
        console.log(err);
    } finally {
        collapseDate = null;
    }
}

const collapseInfo = async (interaction: CommandInteraction): Promise<void> => {
    if (!collapseDate) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.Info.NoCollapse);
        return;
    }

    let minutesUntilCollapse = getMinutesUntilCollapse();
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
            let voidChannel = VoidInteractionUtils.getVoidChannel(interaction);
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

const collapseLater = async (interaction: CommandInteraction, eventEmitter: EventEmitter): Promise<void> => {
    let stabilized = false;
    let minutesInput = getMinutesInput(interaction);

    if (minutesInput < 1) {
        await VoidInteractionUtils.privateReply(interaction, Strings.Collapse.Later.Minutes.LessThanOne);
        return;
    }

    let mintuesInMilliseconds = minutesInput * 60000;
    collapseDate = new Date(Date.now() + mintuesInMilliseconds);

    //Listen for the stabilize command while a collapse is in progress
    eventEmitter.once('stabilize', async (stabilizeInteraction: CommandInteraction, callback: (collapseInteraction: CommandInteraction) => Promise<void>) => {
        stabilized = true;
        collapseDate = null;
        await interaction.followUp(<InteractionReplyOptions>{
            content: Strings.Collapse.Later.StabilizedBy(interaction.user),
            ephemeral: true
        });

        callback(stabilizeInteraction);
    });

    //Split collapse into chunks
    let chunks = 5;
    let secondsUntilCollapse = minutesInput * 60;
    let voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

    await interaction.deferReply();
    for (let i = 0; i < secondsUntilCollapse; i++) {
        if (stabilized) {
            await voidChannel?.send(Strings.Stabilize.Stabilized);
            return;
        }

        await wait(1000);

        if (i === 0) {
            const beginRumbling = Strings.Collapse.Later.BeginCollapse(minutesInput);
            await interaction.editReply(beginRumbling);
            await voidChannel?.send(beginRumbling);
            continue;
        }

        if (i + 1 === secondsUntilCollapse - 60) {
            //Give a final notice one minute before collapsing
            await voidChannel?.send(Strings.Collapse.Later.FinalWarning);
            continue;
        } else if (i + 1 > secondsUntilCollapse - 60) {
            continue;
        }

        if ((i + 1) % (secondsUntilCollapse / chunks) === 0) {
            await voidChannel?.send(getRandomCollapsingString());
        }
    }

    await voidChannel?.delete();

    if (shouldSmother(interaction)) {
        if (interaction.channelId != voidChannel?.id) {
            await interaction.followUp(Strings.Collapse.Later.Smothered);
        }
    } else {
        await VoidInteractionUtils.createVoidChannel(interaction);

        if (interaction.channelId != voidChannel?.id) {
            await interaction.followUp(Strings.Collapse.Later.Collapsed);
        }
    }

    collapseDate = null;
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

const getMinutesUntilCollapse = (): number => {
    let collapseDateMilliseconds = (<Date>collapseDate).getTime();
    let millisecondsUntilCollapse = collapseDateMilliseconds - new Date().getTime();
    let secondsUntilCollapse = millisecondsUntilCollapse / 1000;
    let minutesUntilCollpse = secondsUntilCollapse / 60;

    return minutesUntilCollpse;
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

const shouldSmother = (interaction: CommandInteraction): boolean | null => {
    return interaction.options.getBoolean(Strings.Collapse.Smother.Name);
}

const getRandomCollapsingString = (): string => {
    const index = getRandomIntInclusive(0, Strings.Collapse.Later.CollapsingStrings.length - 1);
    return Strings.Collapse.Later.CollapsingStrings[index];
}

const getRandomIntInclusive = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}