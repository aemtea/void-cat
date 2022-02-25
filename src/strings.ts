import { User } from "discord.js";

export namespace Strings {
    export namespace General {
        export const NoPermission: string = 'You don\'t have permissions to do that. Sorry!';
    }

    export namespace Initialize {
        export const Name: string = 'initialize';
        export const Description: string = 'Reaches into the nothingness and returns with the void.';
        export const VoidExists: string = 'Void already exists.';
        export const VoidCreated: string = 'You stare into the void. The void stares back at you.';
        export const Error: string = 'You call out to the void and hear nothing in return.';
    }

    export namespace Speak {
        export const Name: string = 'speak';
        export const Description: string = 'Speak through the Void Cat.';
        export const NoVoid: string = 'There is no void to speak through.';
        export const Error: string = 'The void refuses your incantation.';

        export namespace Incancation {
            export const Name: string = 'incantation';
            export const Description: string = 'The incantation to speak.';
        }

        export const RepeatIncanation = (incantation: string):string => {
            return `Void Cat repeats your incantation: "${incantation}"`;
        }
    }

    export namespace Stabilize {
        export const Name: string = 'stabilize';
        export const Description: string = 'Stabilizes the void if the void is currently collapsing.';
        export const Stabilized: string = 'The void stabilizes.';
        export const NoVoid: string = 'There is no void to speak through.';
        export const NoCollapse: string = 'No collapse in progress.';
        export const Error: string = 'Void failed to stabilize.';
    }

    export namespace Collapse {
        export const Name: string = 'collapse';
        export const Description: string = 'Collapses the void into nothingness.';

        export const CollapseInProgress: string = 'Void collapse is in process.';
        export const NoVoid: string = 'There is no void to collapse.';
        export const Error: string = 'The void stabilizes unexpectedly.';

        export namespace Smother {
            export const Name: string = 'smother';
            export const Description: string = 'Will not recreate the void if true.';
        }

        export namespace Info {
            export const Name: string = 'info';
            export const Description: string = 'Gets info about collapse in progress.';
            export const NoCollapse: string = 'No collapse in progress.';
            export const Error: string = 'Failed to get void information.';

            export const MinutesRemaining = (minutesUntilCollapse: number): string => {
                return `Void will collapse in ${minutesUntilCollapse.toFixed(2)} minutes.`;
            }
        }

        export namespace Now {
            export const Name: string = 'now';
            export const Description: string = 'Immediately collapses the void. Recreates the void by default.';

            export const Confirm: string = 'Are you sure you want to collapse the void?';
            export const ConfirmId: string = 'collapseNow';
            export const ConfirmLabel: string = 'Collapse';
            export const Collapsing: string = 'Collapsing the void...';

            export const CancelId: string = 'collapseCancel';
            export const CancelLabel: string = 'Cancel';
            export const Cancelled: string = 'Collapse cancelled.';

            export const CollapsedBy = (user: User): string => {
                return `Void collapsed by ${user}. It reappears in an instant.`;
            }

            export const CollapsedBySmother = (user: User): string => {
                return `Void collapsed by ${user}.`;
            }
        }

        export namespace Later {
            export const Name: string = 'later';
            export const Description: string = 'Collapses the void in a set amount of time. Recreates the void by default.';

            export const FinalWarning: string = 'The void is almost no more. Have you accepted its fate?';
            export const Smothered: string = 'The void vanishes without a trace.';
            export const Collapsed: string = 'The void collapses and reappears in an instant.';

            export namespace Minutes {
                export const Name: string = 'minutes';
                export const Description: string = 'Number of minutes until void collapse.';
                export const LessThanOne: string = 'Minutes must be greater than or equal to 1.';
            }

            export const CollapsingStrings: string[] = [
                'The rumbling intensifies in all directions',
                'Your bones are rattled to the core',
                'Throw your secrets into the darkness',
                'The lights are flickering spookily',
                'Your body begins to stretch as it spaghettifies',
                'AHHHHHHHH'
            ];

            export const BeginCollapse = (minutes: number): string => {
                return `The void begins to rumble. ${minutes} minutes remaining...`;
            }

            export const StabilizedBy = (user: User): string => {
                return `Void stabilized by ${user}`;
            }
        }
    }

    export namespace Pet {
        export const Name: string = 'pet';
        export const Description: string = 'Pet the Void Cat. It doesn\'t bite... At least I don\'t think it does.';
        export const Error: string = 'Void Cat isn\'t in the mood right now.';
    }
}