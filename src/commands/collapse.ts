import util from 'util';
import EventEmitter from 'events';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Collection, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, InteractionReplyOptions, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';
import CollapseType from '../enums/collapseType';

const wait = util.promisify(setTimeout);

let collapseDate: Date | null = null;

export const data = new SlashCommandBuilder()
    .setName('collapse')
    .setDescription('Collapses the void into nothingness.')
    .addSubcommand(subcommand =>
        subcommand.setName(CollapseType.Later)
            .setDescription('Collapses the void in a set amount of time. Recreates the void by default.')
            .addIntegerOption(option =>
                option.setName('minutes')
                    .setDescription('Number of minutes until void collapse.')
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName('smother')
                    .setDescription('Will not recreate the void if true.')
                    .setRequired(false)))
    .addSubcommand(subcommand =>
        subcommand.setName(CollapseType.Info)
            .setDescription('Gets info about collapse in progress.'))
    .addSubcommand(subcommand =>
        subcommand.setName(CollapseType.Now)
            .setDescription('Immediately collapses the void. Recreates the void by default.')
            .addBooleanOption(option =>
                option.setName('smother')
                    .setDescription('Will not recreate the void if true.')
                    .setRequired(false)))

export const execute = async (interaction: CommandInteraction, eventEmitter: EventEmitter) => {
    let collapseType = getCollpaseType(interaction);

    try {
        if (!VoidInteractionUtils.canManageChannel(interaction)) {
            await VoidInteractionUtils.privateReply(interaction, 'You don\'t have permissions to do that. Sorry!');
            return;
        }
        if (collapseType === CollapseType.Info) {
            await collapseInfo(interaction);
            return;
        }

        if (collapseDate) {
            await VoidInteractionUtils.privateReply(interaction, 'Void collapse is in process.');
            return;
        }

        let voidChannel = VoidInteractionUtils.getVoidChannel(interaction);

        if (!voidChannel) {
            await VoidInteractionUtils.privateReply(interaction, 'There is no void to collapse.');
            return;
        }
    } catch (err) {
        await VoidInteractionUtils.privateReply(interaction, 'Failed to get void information.');
        console.log(err);
        return;
    }

    try {
        if (collapseType === CollapseType.Now) {
            await collapseNow(interaction);
        } else if (collapseType === CollapseType.Later) {
            await collapseLater(interaction, eventEmitter);
        }
    } catch (err) {
        await interaction.followUp('The void stabilizes unexpectedly.');
        console.log(err);
    } finally {
        collapseDate = null;
    }
}

const collapseInfo = async (interaction: CommandInteraction): Promise<void> => {
    if (!collapseDate) {
        await VoidInteractionUtils.privateReply(interaction, 'No collapse in progress.');
        return;
    }

    let minutesUntilCollapse = getMinutesUntilCollapse();
    await interaction.reply(`Void will collapse in ${minutesUntilCollapse.toFixed(2)} minutes.`);
    return;
}

const collapseNow = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply(<InteractionDeferReplyOptions>{
        ephemeral: true
    });

    const buttons = getCollapseNowButtons();

    await interaction.editReply(<InteractionReplyOptions>{
        content: 'Are you sure you want to collapse the void?',
        ephemeral: true,
        components: [buttons]
    });

    const filter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;
    const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 15000 });

    collector?.on('collect', async (i: MessageComponentInteraction) => {
        if (i.customId === 'collapseNow') {
            await i.update(<InteractionDeferUpdateOptions>{ content: 'Collapsing the void...', components: [] });
            let voidChannel = VoidInteractionUtils.getVoidChannel(interaction);
            await voidChannel?.delete();

            if (interaction.options.getBoolean('smother')) {
                if (interaction.channelId != voidChannel?.id) {
                    await i.followUp(`Void collapsed by ${interaction.user}.`);
                }
            } else {
                if (interaction.channelId != voidChannel?.id) {
                    await VoidInteractionUtils.createVoidChannel(interaction);
                    await i.followUp(`Void collapsed by ${interaction.user}. It reappears in an instant.`);
                }
            }
        } else if (i.customId === 'collapseCancel') {
            await i.update(<InteractionDeferUpdateOptions>{ content: 'Collapse cancelled.', components: [] });
        }
    });

    collector?.on('end', (collected: Collection<string, ButtonInteraction>) => console.log(`Collectoed ${collected.size} items`));
}

const collapseLater = async (interaction: CommandInteraction, eventEmitter: EventEmitter): Promise<void> => {
    let stabilized = false;
    const voidStabilizesString = 'The void stabilizes.';
    let minutesInput = getMinutesInput(interaction);

    if (minutesInput < 1) {
        await VoidInteractionUtils.privateReply(interaction, 'Minutes must be greater than or equal to 1.');
        return;
    }

    let mintuesInMilliseconds = minutesInput * 60000;
    collapseDate = new Date(Date.now() + mintuesInMilliseconds);

    //Listen for the stabilize command while a collapse is in progress
    eventEmitter.once('stabilize', async (stabilizeInteraction: CommandInteraction, callback: (collapseInteraction: CommandInteraction) => Promise<void>) => {
        stabilized = true;
        collapseDate = null;
        await interaction.followUp(<InteractionReplyOptions>{
            content: `Void stabilized by ${stabilizeInteraction.user}`,
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
            await voidChannel?.send(voidStabilizesString);
            return;
        }

        await wait(1000);

        if (i === 0) {
            const beginRumbling = `The void begins to rumble. ${minutesInput} minutes remaining...`;
            await interaction.editReply(beginRumbling);
            await voidChannel?.send(beginRumbling);
            continue;
        }

        if (i + 1 === secondsUntilCollapse - 60) {
            //Give a final notice one minute before collapsing
            await voidChannel?.send('The void is almost no more. Have you accepted its fate?');
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
            await interaction.followUp('The void vanishes without a trace.');
        }
    } else {
        await VoidInteractionUtils.createVoidChannel(interaction);

        if (interaction.channelId != voidChannel?.id) {
            await interaction.followUp('The void collapses and reappears in an instant.');
        }
    }

    collapseDate = null;
}

const getCollpaseType = (interaction: CommandInteraction): CollapseType => {
    var subcommand = interaction.options.getSubcommand();

    return subcommand in CollapseType ? subcommand as CollapseType : CollapseType.Unknown;
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
                .setCustomId('collapseCancel')
                .setLabel('Cancel')
                .setStyle(2) //SECONDARY
        )
        .addComponents(
            new MessageButton()
                .setCustomId('collapseNow')
                .setLabel('Collapse')
                .setStyle(4) //DANGER
        );
}

const getMinutesInput = (interaction: CommandInteraction): number => {
    return interaction.options.getInteger('minutes', true);
}

const shouldSmother = (interaction: CommandInteraction): boolean | null => {
    return interaction.options.getBoolean('smother');
}

const getRandomCollapsingString = (): string => {
    const collapsingStrings = [
        'The rumbling intensifies in all directions',
        'Your bones are rattled to the core',
        'Throw your secrets into the darkness',
        'The lights are flickering spookily',
        'Your body begins to stretch as it spaghettifies',
        'AHHHHHHHH'
    ];
    const index = getRandomIntInclusive(0, collapsingStrings.length - 1);
    return collapsingStrings[index];
}

const getRandomIntInclusive = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}