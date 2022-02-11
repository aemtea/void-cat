import { CommandInteraction } from "discord.js";
import { Collapse } from "./models/collapse";

let collapsesInProgress: Collapse[] = [];

export const getCollapsesInProgress = (): Collapse[] => {
    return collapsesInProgress;
}

export const getCollapseInProgress = (chanelId: string): Collapse => {
    return collapsesInProgress.filter(c => c.voidChannelId === chanelId)[0];
}

export const isCollapseInProgress = (channelId: string): boolean => {
    return collapsesInProgress.some(c => c.voidChannelId === channelId);
}

export const shouldCollapse = (collapse: Collapse): boolean => {
    if (!collapse?.collapseEnd)
        return false;

    const now = new Date();
    return now > collapse.collapseEnd;
}

export const stabilize = (channelId: string) => {
    collapsesInProgress = collapsesInProgress.filter(c => c.voidChannelId !== channelId);
}

export const beginCollapse = (channelId: string, interaction: CommandInteraction, minutes: number, shouldSmother: boolean): void => {
    const now = new Date();
    const mintuesInMilliseconds = minutes * 60000;

    const collapse = new Collapse(
        channelId,
        interaction,
        now,
        new Date(now.getTime() + mintuesInMilliseconds),
        shouldSmother);

    collapsesInProgress.push(collapse);
}

export const endCollapse = (collapse: Collapse): void => {
    stabilize(collapse.voidChannelId);
}