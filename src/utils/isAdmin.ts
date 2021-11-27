import { ApplicationCommandPermissions, Guild, User } from "discord.js";

export const PermissionAdmin = (
  guild: Guild
): ApplicationCommandPermissions => {
  const adminRole = guild.roles.cache.find((r) => r.name === "admin");
  console.log(adminRole);
  return { id: adminRole?.id || "", permission: true, type: "ROLE" };
};

const isAdmin = (user: User) => {
  if (!(interaction.member instanceof GuildMember)) {
    interaction.reply("❌ interaction.member instanceof GuildMember");
    return;
  }
  if (user.)
};

export default isAdmin;
