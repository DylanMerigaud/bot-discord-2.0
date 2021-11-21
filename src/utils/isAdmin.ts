import { ApplicationCommandPermissions, Guild } from "discord.js";

const isAdmin = (guild: Guild): ApplicationCommandPermissions => {
  const adminRole = guild.roles.cache.find((r) => r.name === "admin");
  return { id: adminRole?.id || "", permission: true, type: "ROLE" };
};

export { isAdmin };

export default isAdmin;
