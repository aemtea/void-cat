import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ContextMenuInteraction, InteractionReplyOptions, Message, TextChannel } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
    .setName('Report Message')
    .setType(3) //MESSAGE

export const execute = async (interaction: ContextMenuInteraction) => {
    try {
        const message = <Message> interaction.options.getMessage('message', true);
        const modChat = <TextChannel>interaction.guild?.channels.cache.find(x => x.name.toLowerCase() === 'mod-chat');

        if (!modChat) {
            await interaction.reply(<InteractionReplyOptions> {
                content: 'Failed to report message. Please message the moderators directly.',
                ephemeral: true
            });
        }

        await modChat.send(`${interaction.user} has reported the following message: 

> **${message.author}**: ${message.content}

${message.url}`);

        await interaction.reply(<InteractionReplyOptions> {
            content: 'This message has been reported to the moderators.',
            ephemeral: true
        });
    } catch (err) {
        console.log(err);

        await interaction.reply(<InteractionReplyOptions> {
            content: 'Failed to report message. Please message the moderators directly.',
            ephemeral: true
        });
    }
}