export class Collapse {
    channelId: string;
    collapseStart: Date;
    collapseEnd: Date;
    shouldSmother: boolean;

    constructor(channelId: string, collapseStart: Date, collapseEnd: Date, shouldSmother: boolean)
    {
        this.channelId = channelId;
        this.collapseStart = collapseStart;
        this.collapseEnd = collapseEnd;
        this.shouldSmother = shouldSmother
    }

    public getMillisecondsUntilCollapse = (): number => {
        return this.collapseEnd!.getTime() - new Date().getTime();
    }

    public getTotalMillisecondsUntilCollapse = (): number => {
        return this.collapseEnd.getTime() - this.collapseStart.getTime()
    }

    public getSecondsUntilColapse = (): number => {
        const millisecondsUntilCollapse = this.getMillisecondsUntilCollapse();
        const secondsUntilCollapse = this.convertMillisecondsToSeconds(millisecondsUntilCollapse);
        return Math.round(secondsUntilCollapse);
    }

    public getTotalSecondsUntilCollapse = (): number => {
        const totalMillisecondsUntilCollapse = this.getTotalMillisecondsUntilCollapse();
        const totalSecondsUntilCollapse = this.convertMillisecondsToSeconds(totalMillisecondsUntilCollapse);
        return Math.round(totalSecondsUntilCollapse);
    }

    public getMinutesUntilColapse = (): number => {
        const secondsUntilCollapse = this.getSecondsUntilColapse();
        const minutesUntilCollpse = this.convertSecondsToMinutes(secondsUntilCollapse);
        return minutesUntilCollpse;
    }

    private convertMillisecondsToSeconds = (milliseconds: number): number => {
        return milliseconds / 1000;
    }

    private convertSecondsToMinutes = (seconds: number): number => {
        return seconds / 60;
    }
}