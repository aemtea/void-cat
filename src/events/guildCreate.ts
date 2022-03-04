import { Guild } from "discord.js";

module.exports = {
    name: 'guildCreate',
    once: true,
    execute(guild: Guild) {
        // Get last log to determine user who added the bot
        guild.fetchAuditLogs({type: "BOT_ADD", limit: 1}).then(log => {
            var user = log?.entries?.first()?.executor!!;

            // Grant that user all command permissions
            guild.client.application?.commands.fetch().then(commands => {
                commands.forEach(command => {
                    command.permissions.set({
                        guild: guild,
                        permissions: [
                            {
                                id: user.id,
                                type: 'USER',
                                permission: true
                            }
                        ]
                    }).then(x => {
                        console.log(`Set permission for user ${user.username} on command: ${command.name}`);
                    }).catch(x => {
                        console.log(`Error setting permission for command: ${command.name}`);
                    });
                });
            });
        });
    },
};