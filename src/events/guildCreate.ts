import { ApplicationCommand, ApplicationCommandPermissions, Guild, GuildResolvable, User } from "discord.js";

module.exports = {
    name: 'guildCreate',
    once: true,
    async execute(guild: Guild) {        
        var user = await getAddingUser(guild);
        var commands = await guild.client.application?.commands.fetch();

        if (!commands)
            return;

        var promises: Promise<ApplicationCommandPermissions[]>[] = [];
        commands.forEach(command => {
            promises.push(grantPermission(guild, user, command));
        });

        Promise.all(promises).then(_ => {
            console.log(`Set permission for user ${user.username} on all commands`);
        });
    },
};

const getAddingUser = async (guild: Guild): Promise<User> => {
    var logs = await guild.fetchAuditLogs({type: "BOT_ADD", limit: 1});
    var user = logs?.entries?.first()?.executor!!;

    return user;
}

const grantPermission = async (guild: Guild, user: User, command: ApplicationCommand<{guild: GuildResolvable}>): Promise<ApplicationCommandPermissions[]> => {
    var permissions: ApplicationCommandPermissions[];

    try {
        permissions = await command.permissions.fetch({guild: guild});
    } catch {
        permissions = [];
    }

    var userPermission = permissions.filter(permission => permission.id === user.id)[0];
    if (userPermission && userPermission.permission) {
        return new Promise<ApplicationCommandPermissions[]>((resolve, reject) => {
            resolve(permissions);
        });
    } else if (!userPermission) {
        permissions.push({
            id: user.id,
            type: 'USER',
            permission: true
        });
    } else if (!userPermission.permission) {
        userPermission.permission = true;
    }

    var promise = command.permissions.set({
        guild: guild,
        permissions: permissions
    });

    promise.catch(err => {
        console.log(`Error setting permission for user ${user.username} on command ${command.name} with error: ${err}`);
    });

    return promise;
}