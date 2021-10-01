import util from 'util';
import EventEmitter from 'events';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Collection, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, InteractionReplyOptions, MessageActionRow, MessageButton, Permissions } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

const wait = util.promisify(setTimeout);

let collapseInProgress = false;
let collapseDate: Date | null = null;

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
        subcommand.setName('info')
            .setDescription('Gets info about collapse in progress.'))
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

        if (interaction.options.getSubcommand() === 'info') {
            if (!collapseDate) {
                await interaction.reply('No collapse in progress.');
                return;
            }

            //Get difference in minutes to 2 decimals
            let now = new Date();
            let minutesUntilCollapse = ((collapseDate?.getTime() - now.getTime()) / 1000 / 60).toFixed(2);
            await interaction.reply(`Void will collapse in ${minutesUntilCollapse} minutes.`);
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
            let minutesInput = interaction.options.getInteger('minutes', true);

            if (minutesInput < 1) {
                await interaction.reply(<InteractionReplyOptions>{
                    content: 'Minutes must be greater than or equal to 1.',
                    ephemeral: true
                });
                return;
            }

            //Add minutes input to current time
            collapseDate = new Date(Date.now() + minutesInput * 60000);

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

            await interaction.deferReply();
            for (let i = 0; i < secondsUntilCollapse; i++) {
                if (stabilized) {
                    await theVoid.send(voidStabilizesString);
                    return;
                }

                await wait(1000);

                if (i === 0) {
                    const beginRumbling = 'The void begins to rumble...';
                    await interaction.editReply(beginRumbling);
                    await theVoid.send(beginRumbling);
                    continue;
                }
                
                if (i + 1 === secondsUntilCollapse - 60) {
                    //Give a final notice one minute before collapsing
                    await theVoid.send('The void is almost no more. Have you accepted its fate?');
                    continue;
                } else if (i + 1 > secondsUntilCollapse - 60) {
                    continue;
                }

                if ((i + 1) % (secondsUntilCollapse / chunks) === 0) {
                    await theVoid.send(getRandomCollapsingString());
                }
            }

            await theVoid.delete();

            if (interaction.channelId != theVoid.id) {
                await interaction.followUp('The void vanishes without a trace.');
            }

            collapseDate = null;
        }
    } catch (err) {
        await interaction.followUp('The void stabilizes unexpectedly.');
        console.log(err);
    } finally {
        collapseInProgress = false;
    }
}

const getRandomCollapsingString = (): string => {
    const collapsingStrings = [
        'The rumbling intensifies in all directions',
        'Your bones are being rattled to their core',
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