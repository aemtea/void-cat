import { Collapse } from "./models/collapse";

let collapsesInProgress: Collapse[] = [];

export const getCollapse = (chanelId: string): Collapse => {
    return collapsesInProgress.filter(c => c.channelId === chanelId)[0];
}

export const isCollapseInProgress = (channelId: string): boolean => {
    return collapsesInProgress.some(c => c.channelId === channelId);
}

export const shouldCollapse = (collapse: Collapse): boolean => {
    if (!collapse?.collapseEnd)
        return false;

    const now = new Date();
    return now > collapse.collapseEnd;
}

export const stabilize = (channelId: string) => {
    collapsesInProgress = collapsesInProgress.filter(c => c.channelId !== channelId);
}

export const beginCollapse = (channelId: string, minutes: number, shouldSmother: boolean): void => {
    const now = new Date();
    const mintuesInMilliseconds = minutes * 60000;

    const collapse = new Collapse(
        channelId,
        now,
        new Date(now.getTime() + mintuesInMilliseconds),
        shouldSmother);

    collapsesInProgress.push(collapse);
}

export const endCollapse = (collapse: Collapse): void => {
    stabilize(collapse.channelId);
}

export const getCollapseInProgress = (): Collapse[] => {
    return collapsesInProgress;
}