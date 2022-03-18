import { SlashCommandBuilder } from "@discordjs/builders";
import { APIRole } from "discord-api-types";
import { ApplicationCommand, ApplicationCommandPermissions, CommandInteraction, GuildResolvable, Role } from "discord.js";
import { Strings } from "../strings";
import { VoidInteractionUtils } from "../utils/voidInteractionUtils";

export const data = new SlashCommandBuilder()
    .setName(Strings.Commune.Name)
    .setDescription(Strings.Commune.Description)
    .setDefaultPermission(false)
    .addRoleOption(option =>
        option.setName(Strings.Commune.Role.Name)
        .setDescription(Strings.Commune.Role.Description)
        .setRequired(true));

export const execute = async (interaction: CommandInteraction) => {
    try {
        await interaction.deferReply();
        var commands = await interaction.client.application?.commands.fetch();

        if (!commands)
            return;

        var role = getRole(interaction);
        var promises: Promise<ApplicationCommandPermissions[]>[] = [];
        commands.forEach(command => {
            promises.push(grantPermission(interaction, command, role));
        });

        Promise.all(promises).then(async _ => {
            await interaction.editReply(Strings.Commune.Success(role));
        }).catch(async _ => {
            await interaction.editReply(Strings.Commune.Error);
        })
    } catch (err) {
        if (interaction.deferred) {
            await interaction.editReply(Strings.Commune.Error);
        } else {
            await interaction.reply(Strings.Commune.Error);
        }
        
        console.log(err);
    }
}

const grantPermission = async (interaction: CommandInteraction, command: ApplicationCommand<{guild: GuildResolvable}>, role: Role | APIRole): Promise<ApplicationCommandPermissions[]> => {
    var permissions = await command.permissions.fetch({guild: interaction.guild!});
    var rolePermission = permissions.filter(permission => permission.id === role.id)[0];

    if (!rolePermission) {
        permissions.push({
            id: role.id,
            type: 'ROLE',
            permission: true
        });
    }

    var promise = command.permissions.set({
        guild: interaction.guild!,
        permissions: permissions
    });

    promise.catch(err => {
        console.log(`Error setting permission for role ${role.name} on command: ${command.name} with error: ${err}`);
    });

    return promise;
}

const getRole = (interaction: CommandInteraction): Role | APIRole => {
    return interaction.options.getRole(Strings.Commune.Role.Name, true);
}