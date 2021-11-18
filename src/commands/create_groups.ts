import {
  ApplicationCommandPermissions,
  ButtonInteraction,
  CommandInteraction,
  Guild,
  GuildMember,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import {
  ButtonComponent,
  Discord,
  Permission,
  Slash,
  SlashOption,
} from "discordx";

@Discord()
class groupuscules {
  @Permission(false)
  @Permission((guild: Guild): ApplicationCommandPermissions => {
    const adminRole = guild.roles.cache.find((r) => r.name === "admin"); // add delay
    return { id: adminRole?.id || "", permission: true, type: "ROLE" };
  })
  @Slash("groupuscules", {
    description: "Affichage de la repartition des groupes",
  })
  async groupuscules(
    @SlashOption("nmax", {
      description: "Personnes max par groupes",
      required: true,
    })
    nmax: number,
    interaction: CommandInteraction
  ) {
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply("Error");
      return;
    }

    await interaction.deferReply();

    const moveButton = new MessageButton()
      .setLabel("Deplacer")
      .setEmoji("⬇️")
      .setStyle("PRIMARY")
      .setCustomId("move-btn");

    const row = new MessageActionRow().addComponents(moveButton);

    // const users =
    //   interaction.member.voice.channel?.members.map((m) => m.user.username) ||
    //   [];

    const users = [...Array(30)].map(() => {
      const randomStr = "abcdefghijklmnopqrstuvwxyz"
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");
      return randomStr.slice(0, Math.random() * 26 + 2);
    });

    const groups = users.reduce(
      (resultArray: Array<Array<String>>, item, index) => {
        const chunkIndex = Math.floor(index / nmax);
        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = []; // start a new chunk
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
      },
      []
    );

    let i = groups.length - 1;
    while (i > 0) {
      if (groups[i - 1].length > groups[i].length) {
        groups[i].push(groups[i - 1][groups[i - 1].length - 1]);
        groups[i - 1].splice(groups[i - 1].length - 1, 1);
        i = groups.length - 1;
      } else i--;
    }

    const response = groups
      .map(
        (g, i) => `🔊 Salon ${i + 1}:\n${g.map((u) => `|   ${u}\n`).join("")}\n`
      )
      .join("");

    interaction.editReply({
      content: response,
      components: [row],
    });
    // interaction.reply(response);
  }

  @ButtonComponent("move-btn")
  moveButton(interaction: ButtonInteraction) {
    const groups = interaction.message.content
      .split(`🔊 Salon `)
      .slice(1)
      .map((g) =>
        g
          .split(":\n|   ")
          .slice(1)
          .join("")
          .split(`\n|   `)
          .map((u) => u.replace(/\n/g, ""))
      );

    interaction.reply(`${groups.map((g) => g.join("\n#")).join("\n\n/")}`);
  }
}
