import { CategoryChannel, CommandInteraction, GuildChannelCreateOptions, TextChannel, ThreadChannel } from "discord.js";

const _voidCategoryString = 'HOUSEPLANT ZONE';
const _voidChannelString = 'the-void';

export module VoidInteractionUtils {
    export const getVoidCategory = (interaction: CommandInteraction): CategoryChannel => {
        const voidCategory = <CategoryChannel>interaction.guild?.channels.cache.find(x => x.name.toUpperCase() === _voidCategoryString && x.type == 'GUILD_CATEGORY');

        return voidCategory;
    }

    export const getVoidChannel = (interaction: CommandInteraction): ThreadChannel | null => {
        const voidCategory = getVoidCategory(interaction);
        if (!voidCategory) {
            return null
        }

        const voidChannel = <ThreadChannel>interaction.guild?.channels.cache.find(x => x.name.toLowerCase() === _voidChannelString && x.parentId == voidCategory?.id);

        return voidChannel;
    }

    export const createVoidCategory = async (interaction: CommandInteraction): Promise<CategoryChannel> => {
        const voidCategory = <CategoryChannel>await interaction.guild?.channels.create(_voidCategoryString, <GuildChannelCreateOptions>{
            type: 4 //ChannelTypes.GUILD_CATEGORY
        });

        return voidCategory;
    }

    export const createVoidChannel = async (interaction: CommandInteraction): Promise<TextChannel> => {
        let voidCategory = getVoidCategory(interaction);

        if (!voidCategory) {
            voidCategory = await createVoidCategory(interaction);
        }

        const voidChannel = <TextChannel>await interaction.guild?.channels.create(_voidChannelString, <GuildChannelCreateOptions>{
            nsfw: true,
            parent: voidCategory?.id
        });

        return voidChannel;
    }
}