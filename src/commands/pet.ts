import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Strings } from "../strings";
import { VoidInteractionUtils } from "../utils/voidInteractionUtils";
import * as tenorUtils from '../utils/tenorUtils';

export const data = new SlashCommandBuilder()
    .setName(Strings.Pet.Name)
    .setDescription(Strings.Pet.Description);

export const execute = async (interaction: CommandInteraction) => {
    try {
        await interaction.deferReply();

        var randomGifRequest: TenorRandomGifRequest = {
            q: 'black%20cat',
            contentfilter: 'low',
            limit: 1
        }

        const result = await tenorUtils.getRandomGifs(randomGifRequest);
        await interaction.editReply(result.results[0].url);
    } catch (err) {
        if (interaction.deferred) {
            await interaction.editReply(Strings.Pet.Error);
        } else {
            await interaction.reply(Strings.Pet.Error);
        }
        
        console.log(err);
    }
}