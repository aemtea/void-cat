import util from 'util';
import EventEmitter from 'events';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, Collection, CommandInteraction, InteractionDeferReplyOptions, InteractionDeferUpdateOptions, InteractionReplyOptions, MessageActionRow, MessageButton } from 'discord.js';
import { VoidInteractionUtils } from '../utils/voidInteractionUtils';

const wait = util.promisify(setTimeout);

export const data = new SlashCommandBuilder()
    .setName('collapse')
    .setDescription('Collapses the void into nothingness.')
    .addBooleanOption(option =>
        option.setName('immediate')
            .setDescription('Immediately collapses the void.')
            .setRequired(false))

export const execute = async (interaction: CommandInteraction, eventEmitter: EventEmitter) => {
    try {
        var theVoid = VoidInteractionUtils.getVoidChannel(interaction);

        if (!theVoid) {
            await interaction.reply(<InteractionReplyOptions>{
                content: 'There is no void to collapse.',
                ephemeral: true
            });
            return;
        }

        var immediate = interaction.options.getBoolean('immediate');

        if (immediate) {
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
                    await i.followUp('The void vanishes without a trace.')
                } else if (i.customId === 'collapseCancel') {
                    await i.update(<InteractionDeferUpdateOptions>{ content: 'Collapse cancelled.', components: [] })
                }
            });

            collector?.on('end', (collected: Collection<string, ButtonInteraction>) => console.log(`Collectoed ${collected.size} items`));
        } else {
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

            eventEmitter.once('stabilize', async (i: CommandInteraction, callback: (interaction: CommandInteraction) => Promise<void>) => {
                stabilized = true;
                await interaction.followUp(<InteractionReplyOptions>{
                    content: `Void stabilized by ${i.user}`,
                    ephemeral: true
                });

                callback(i);
            });

            const beginRumbling = 'The void begins to rumble...';
            await interaction.reply(beginRumbling);
            await theVoid.send(beginRumbling);

            if (await isVoidStabilized(10)) {
                await theVoid.send(voidStabilizesString);
                return;
            }

            await theVoid.send('Rumbling intensifies...');

            if (await isVoidStabilized(10)) {
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
    }
}