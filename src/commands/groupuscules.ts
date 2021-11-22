import {
  ApplicationCommandPermissions,
  ButtonInteraction,
  CommandInteraction,
  Guild,
  GuildVoiceChannelResolvable,
  GuildMember,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import {
  ButtonComponent,
  Discord,
  Permission,
  Slash,
  SlashGroup,
  SlashOption,
} from "discordx";
import isAdmin from "../utils/isAdmin";

const channelLabel = `Salon`;
const getChannelName = (index: number) => `${channelLabel} ${index}`;

const groupsCategoryName = `Groupuscules`;

@Discord()
@SlashGroup("groupuscules", "Partie de la reunion en petit commite")
class groupuscules {
  @Permission(false)
  @Permission(isAdmin)
  @Slash("creategroups", {
    description: "Affichage de la repartition des groupes",
  })
  async createGroups(
    @SlashOption("nmax", {
      description: "Personnes max par groupes",
      required: true,
    })
    nmax: number,
    interaction: CommandInteraction
  ) {
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply("❌ interaction.member instanceof GuildMember");
      return;
    }

    const users =
      process.env.DEBUG !== "true"
        ? interaction.member.voice.channel?.members.map(
            (m) => m.user.username
          ) || []
        : [...Array(30)].map((n, i) => {
            if (i === 0) return interaction.user.username;
            const randomStr = "abcdefghijklmnopqrstuvwxyz"
              .split("")
              .sort(() => 0.5 - Math.random())
              .join("");
            return randomStr.slice(0, Math.random() * 26 + 2);
          });
    if (users.length === 0)
      return interaction.reply(
        `❗ Vous devez etre dans un channel vocal avant de lancer la commande`
      );

    if (nmax < 1) return interaction.reply(`❗ nmax doit etre superieur a 0`);

    await interaction.deferReply();

    const moveButton = new MessageButton()
      .setLabel("Deplacer")
      .setEmoji("⬇️")
      .setStyle("PRIMARY")
      .setCustomId("move-btn");

    const row = new MessageActionRow().addComponents(moveButton);

    const groups = users.reduce(
      (resultArray: Array<Array<String>>, item, index) => {
        const chunkIndex = Math.floor(index / nmax);
        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = [];
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
        (g, i) =>
          `${getChannelName(i + 1)}:\n${g.map((u) => `|   ${u}\n`).join("")}\n`
      )
      .join("");

    interaction.editReply({
      content: response,
      components: [row],
    });
    // interaction.reply(response);
  }

  @ButtonComponent("move-btn")
  async moveButton(interaction: ButtonInteraction) {
    const groups = interaction.message.content
      .split(`${channelLabel} `)
      .slice(1)
      .map((g) =>
        g
          .split(":\n|   ")
          .slice(1)
          .join("")
          .split(`\n|   `)
          .map((u) => u.replace(/\n/g, ""))
      );

    const groupsCategory =
      interaction.guild?.channels.cache.find(
        (channel) => channel.name === groupsCategoryName
      ) ||
      (await interaction.guild?.channels.create(groupsCategoryName, {
        type: "GUILD_CATEGORY",
      }));

    groups.forEach(async (group, index) => {
      const channelToMoveMember =
        interaction.guild?.channels.cache.find(
          (channel) =>
            channel.parentId === groupsCategory?.id &&
            channel.name === getChannelName(index + 1)
        ) ||
        (await interaction.guild?.channels.create(getChannelName(index + 1), {
          type: "GUILD_VOICE",
          parent: groupsCategory?.id,
        }));
      if (channelToMoveMember)
        group.forEach((memberDisplayName) => {
          const member = interaction.guild?.members.cache.find(
            (member) => member.displayName === memberDisplayName
          );
          if (member?.voice.channel)
            member?.voice.setChannel(channelToMoveMember.id);
        });
    });

    interaction.reply(`✔️ ${groups.length} Canaux ont ete ajoutés`);

    // interaction.reply(`${groups.map((g) => g.join("\n#")).join("\n\n/")}`);
  }

  @Permission(false)
  @Permission(isAdmin)
  @Slash("deletegroups", {
    description: "Supprime les cannaux de groupes",
  })
  async deleteGroups(interaction: CommandInteraction) {
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply("❌ interaction.member instanceof GuildMember");
      return;
    }

    const groupsCategory = interaction.guild?.channels.cache.find(
      (channel) => channel.name === groupsCategoryName
    );

    const channelsToDelete = interaction.guild?.channels.cache.filter(
      (channel) =>
        channel.parentId === groupsCategory?.id &&
        channel.name.startsWith(channelLabel)
    );

    const userIsInFutureDeletedChannel = !!channelsToDelete?.find(
      (channel) =>
        channel.id === (interaction.member as GuildMember).voice.channelId
    );

    channelsToDelete?.forEach((channel) => {
      if (channel.isVoice())
        channel.members.forEach((member) => {
          if (
            (interaction.member as GuildMember).voice.channelId &&
            !userIsInFutureDeletedChannel
          )
            member.voice.setChannel(
              (interaction.member as GuildMember).voice.channelId
            );
        });
      channel.delete();
    });

    interaction.reply(`✔️ ${channelsToDelete?.size} Canaux ont ete supprimés`);
  }
}
