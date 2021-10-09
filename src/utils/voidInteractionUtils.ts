import { CategoryChannel, CategoryCreateChannelOptions, GuildChannelCreateOptions, Interaction, TextChannel } from "discord.js";

const _voidCategoryString = 'HOUSEPLANT ZONE';
const _voidChannelString = 'the-void';

export module VoidInteractionUtils {
    export const getVoidCategory = (interaction: Interaction): CategoryChannel => {
        const voidCategory = <CategoryChannel>interaction.guild?.channels.cache.find(x => x.name.toUpperCase() === _voidCategoryString && x.type == 'GUILD_CATEGORY');

        return voidCategory;
    }

    export const getVoidChannel = (interaction: Interaction): TextChannel | null => {
        const voidCategory = getVoidCategory(interaction);
        if (!voidCategory) {
            return null
        }

        const voidChannel = <TextChannel>interaction.guild?.channels.cache.find(x => x.name.toLowerCase() === _voidChannelString && x.parentId == voidCategory?.id);

        return voidChannel;
    }

    export const createVoidCategory = async (interaction: Interaction): Promise<CategoryChannel> => {
        const voidCategory = <CategoryChannel>await interaction.guild?.channels.create(_voidCategoryString, <GuildChannelCreateOptions>{
            type: 4 //ChannelTypes.GUILD_CATEGORY
        });

        return voidCategory;
    }

    export const createVoidChannel = async (interaction: Interaction): Promise<TextChannel> => {
        let voidCategory = getVoidCategory(interaction);

        if (!voidCategory) {
            voidCategory = await createVoidCategory(interaction);
        }
        
        const voidChannel = <TextChannel>await voidCategory.createChannel(_voidChannelString, <CategoryCreateChannelOptions> {
            nsfw: true
        });

        return voidChannel;
    }
}