import { Guild } from "discord.js";
import type { ArgsOf } from "discordx";
import { Discord, On, Client } from "discordx";

@Discord()
export abstract class AppDiscord {
  @On("messageDelete")
  onMessage([message]: ArgsOf<"messageDelete">, client: Client) {
    console.log("Message Deleted", client.user?.username, message.content);
  }

  @On("guildCreate")
  async addBotUserRole(guild: Guild) {
    // console.log('addBotUserRole')
    // console.log(guild.roles)
    // if (await guild.roles) console.log('admin exist')
  }
}
