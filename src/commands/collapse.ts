import util from 'util';
import EventEmitter from 'events';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Collection, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, InteractionReplyOptions, MessageActionRow, MessageButton, Permissions } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

const wait = util.promisify(setTimeout);

let collapseInProgress = false;

export const data = new SlashCommandBuilder()
    .setName('collapse')
    .setDescription('Collapses the void into nothingness.')
    .addSubcommand(subcommand =>
        subcommand.setName('later')
            .setDescription('Collapses the void in a set amount of time.')
            .addIntegerOption(option =>
                option.setName('minutes')
                    .setDescription('Number of minutes until void collapse.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand.setName('now')
            .setDescription('Immediately collapses the void.'))

export const execute = async (interaction: CommandInteraction, eventEmitter: EventEmitter) => {
    try {
        const permissions = new Permissions((<Permissions>interaction.member?.permissions));
        if (!permissions.has('MANAGE_CHANNELS')) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'You don\'t have permissions to do that. Sorry!',
                ephemeral: true
            });
            return;
        }

        if (collapseInProgress) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'Void collapse is in process.',
                ephemeral: true
            });
            return;
        }

        var theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (!theVoid) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'There is no void to collapse.',
                ephemeral: true
            });
            return;
        }

        collapseInProgress = true;

        if (interaction.options.getSubcommand() === 'now') {
            await interaction.deferReply(<InteractionDeferReplyOptions>{
                ephemeral: true
            });

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('collapseCancel')
                        .setLabel('Cancel')
                        .setStyle(2) //SECONDARY
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('collapseImmediate')
                        .setLabel('Collapse')
                        .setStyle(4) //DANGER
                );

            await interaction.editReply(<InteractionReplyOptions>{
                content: 'Are you sure you want to collapse the void?',
                ephemeral: true,
                components: [row]
            });

            const filter = (i: ButtonInteraction) => i.user.id === interaction.user.id;
            const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 15000 });

            collector?.on('collect', async (i: ButtonInteraction) => {
                if (i.customId === 'collapseImmediate') {
                    await theVoid!.delete();
                    await i.update(<InteractionDeferUpdateOptions>{ content: 'Collapsing the void...', components: [] })
                    await i.followUp(`Void collapsed by ${interaction.user}.`)
                } else if (i.customId === 'collapseCancel') {
                    await i.update(<InteractionDeferUpdateOptions>{ content: 'Collapse cancelled.', components: [] })
                }
            });

            collector?.on('end', (collected: Collection<string, ButtonInteraction>) => console.log(`Collectoed ${collected.size} items`));
        } else if (interaction.options.getSubcommand() === 'later') {
            let stabilized = false;
            const voidStabilizesString = 'The void stabilizes.';

            const isVoidStabilized = async (secondsToCheck: number): Promise<boolean> => {
                for (let i = 0; i < secondsToCheck; i++) {
                    if (stabilized) {
                        return true;
                    }
                    await wait(1000);
                }

                return false;
            }

            //Listen for the stabilize command while a collapse is in progress
            eventEmitter.once('stabilize', async (i: CommandInteraction, callback: (interaction: CommandInteraction) => Promise<void>) => {
                stabilized = true;
                await interaction.followUp(<InteractionReplyOptions>{
                    content: `Void stabilized by ${i.user}`,
                    ephemeral: true
                });

                callback(i);
            });

            let minutesUntilCollapse = interaction.options.getInteger('minutes', true);

            //Split collapse into chunks
            let chunks = 5;
            let minutesChunks = minutesUntilCollapse / chunks;
            for (let i = 0; i < chunks; i++) {
                if (i === 0) {
                    const beginRumbling = 'The void begins to rumble...';
                    await interaction.reply(beginRumbling);
                    await theVoid.send(beginRumbling);
                } else {
                    await theVoid.send(getRandomCollapsingString());
                }

                if (await isVoidStabilized(minutesChunks * 60)) {
                    await theVoid.send(voidStabilizesString);
                    return;
                }
            }

            //Give a final notice one minute before collapsing
            await theVoid.send('The void is almost no more. Have you accepted its fate?');
            if (await isVoidStabilized(60)) {
                await theVoid.send(voidStabilizesString);
                return;
            }

            await theVoid.delete();

            if (interaction.channelId != theVoid.id) {
                await interaction.followUp('The void vanishes without a trace.');
            }
        }
    } catch (err) {
        await interaction.followUp('The void stabilizes unexpectedly.');
        console.log(err);
    } finally {
        collapseInProgress = false
    }
}

const getRandomCollapsingString = (): string => {
    const collapsingStrings = [
        'The rumbling intensifies in all directions',
        'Your bones are being rattled to their core',
        'Throw your secrets into the darkness',
        'The lights are flickering spookily',
        'Your body begins to stretch as it spaghettifies'
    ];
    const index = getRandomIntInclusive(0, collapsingStrings.length - 1);
    return collapsingStrings[index];
}

const getRandomIntInclusive = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}