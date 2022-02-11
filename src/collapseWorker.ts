import * as CollapseManager from './collapseManager';
import { Strings } from './strings';
import { VoidInteractionUtils } from './utils/voidInteractionUtils';

export class CollapseWorker {
    public doWork = (): void => {
        setInterval(async (): Promise<void> => {
            const collapsesInProgress = CollapseManager.getCollapsesInProgress();
            if (!collapsesInProgress.length)
                return;

            for (let i = 0; i < collapsesInProgress.length; i++) {
                const collapse = collapsesInProgress[i];
                const secondsUntilCollapse = collapse.getSecondsUntilColapse();
                const totalSecondsUntilCollapse = collapse.getTotalSecondsUntilCollapse();

                const voidChannel = VoidInteractionUtils.getVoidChannel(collapse.interaction);
                const message = this.getCollapsingMessage(secondsUntilCollapse, totalSecondsUntilCollapse);
                
                if (message) {
                    await voidChannel?.send(message);
                }

                if (!CollapseManager.shouldCollapse(collapse)) {
                    continue;
                }

                CollapseManager.endCollapse(collapse);
                await voidChannel?.delete();

                if (collapse.shouldSmother) {
                    if (collapse.interaction.channelId != voidChannel?.id) {
                        await collapse.interaction.followUp(Strings.Collapse.Later.Smothered);
                    }
                } else {
                    VoidInteractionUtils.createVoidChannel(collapse.interaction)
                    if (collapse.interaction.channelId != voidChannel?.id) {
                        await collapse.interaction.followUp(Strings.Collapse.Later.Collapsed);
                    }
                }
            }

        }, 1000);
    }

    private getCollapsingMessage = (secondsUntilCollapse: number, totalSecondsUntilCollapse: number): string | null => {
        const chunks =  process.env.MESSAGE_CHUNKS ? parseInt(process.env.MESSAGE_CHUNKS) :  6;
        if (secondsUntilCollapse === totalSecondsUntilCollapse || secondsUntilCollapse === 0) {
            return null;
        } else if (secondsUntilCollapse === 60) {
            // Give a final notice one minute before collapsing            
            return Strings.Collapse.Later.FinalWarning;
        } else if (secondsUntilCollapse % (totalSecondsUntilCollapse / chunks) === 0) {
            return this.getRandomCollapsingString();
        } else {
            return null;
        }
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