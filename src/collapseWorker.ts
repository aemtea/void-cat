import { CategoryChannel, CategoryCreateChannelOptions, Client, TextChannel } from 'discord.js';
import * as CollapseManager from './collapseManager';
import { Strings } from './strings';

export class CollapseWorker {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public doWork = (): void => {
        setInterval(async (): Promise<void> => {
            const collapsesInProgress = CollapseManager.getCollapseInProgress();
            if (!collapsesInProgress.length)
                return;

            const chunks = 5;
            for (let i = 0; i < collapsesInProgress.length; i++) {
                const collapse = collapsesInProgress[i];
                const secondsUntilCollapse = collapse.getSecondsUntilColapse();
                const totalSecondsUntilCollapse = collapse.getTotalSecondsUntilCollapse();

                const voidChannel = <TextChannel>this.client.channels.cache.get(collapse.channelId);
                const voidCategory = <CategoryChannel>this.client.channels.cache.get(voidChannel.parentId!);
                if (secondsUntilCollapse === totalSecondsUntilCollapse - 60) {
                    // Give a final notice one minute before collapsing
                    await voidChannel?.send(Strings.Collapse.Later.FinalWarning);
                    return;
                } else if (secondsUntilCollapse % (totalSecondsUntilCollapse / chunks) === 0) {
                    // TODO don't post message immediately
                    await voidChannel?.send(this.getRandomCollapsingString());
                }

                if (CollapseManager.shouldCollapse(collapse)) {
                    CollapseManager.endCollapse(collapse);
                    await voidChannel?.delete();

                    if (collapse.shouldSmother) {
                        // TODO post smother message
                        // if (interaction.channelId != voidChannel?.id) {
                        //     await interaction.followUp(Strings.Collapse.Later.Smothered);
                        // }
                    } else {
                        await this.createVoidChannel(voidCategory);
                        // TODO post collapsed message
                        // if (interaction.channelId != voidChannel?.id) {
                        //     await interaction.followUp(Strings.Collapse.Later.Collapsed);
                        // }
                    }
                }
            }


        }, 1000);
    }

    private createVoidChannel = async (voidCategory: CategoryChannel): Promise<TextChannel> => {
        const voidChannel = <TextChannel>await voidCategory.createChannel('', <CategoryCreateChannelOptions> {
            nsfw: true
        });

        return voidChannel;
    }

    private getRandomCollapsingString = (): string => {
        const index = this.getRandomIntInclusive(0, Strings.Collapse.Later.CollapsingStrings.length - 1);
        return Strings.Collapse.Later.CollapsingStrings[index];
    }

    private getRandomIntInclusive = (min: number, max: number) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }
}