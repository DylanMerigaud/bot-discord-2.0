import { ApplicationCommandPermissions, Guild, User } from "discord.js";

export const PermissionAdmin = (
  guild: Guild
): ApplicationCommandPermissions => {
  const adminRole = guild.roles.cache.find((r) => r.name === "admin");
  console.log(adminRole);
  return { id: adminRole?.id || "", permission: true, type: "ROLE" };
};

const isAdmin = (user: User) => {
  throw new Error("not implemented");
};

export default isAdmin;
