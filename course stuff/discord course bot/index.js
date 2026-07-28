const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
require('dotenv').config();

const config = require('./config');
const content = require('./content');

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember],
});

/** @type {Set<string>} pending unlock keys: `${userId}:${day}` — lost on bot restart */
const pendingUnlocks = new Set();

function pendingKey(userId, day) {
  return `${userId}:${day}`;
}

function memberHasRole(member, roleId) {
  return member.roles.cache.has(roleId);
}

async function postDayEmbed(interaction, day) {
  const dayConfig = config.days[day];
  const channel = await client.channels.fetch(dayConfig.channelId);

  if (!channel || !channel.isTextBased()) {
    await interaction.reply({
      content: `Could not find a text channel for Day ${day} (\`${dayConfig.channelId}\`).`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await channel.send(content.buildDayMessage(day));

  await interaction.reply({
    content: `Posted Day ${day} content in <#${dayConfig.channelId}>.`,
    flags: MessageFlags.Ephemeral,
  });
}

/**
 * Days 1–2: confirm immediately, grant next role after UNLOCK_DELAY_MS.
 * Day 3: grant completion role immediately.
 */
async function handleDayComplete(interaction, day) {
  const dayConfig = config.days[day];
  const texts = content.byDay[day];
  const member = interaction.member;

  if (!member || !('roles' in member)) {
    await interaction.reply({
      content: 'Could not resolve your member record. Try again in the server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const nextRoleId = dayConfig.nextRoleId;
  const key = pendingKey(member.id, day);

  // Deduplicate: already has next/completion role, or unlock already scheduled
  if (memberHasRole(member, nextRoleId) || pendingUnlocks.has(key)) {
    await interaction.reply({
      content: texts.alreadyDone,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (day === 3) {
    await member.roles.add(config.completionRoleId);
    await interaction.reply({
      content: texts.confirm,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  pendingUnlocks.add(key);

  await interaction.reply({
    content: texts.confirm,
    flags: MessageFlags.Ephemeral,
  });

  // NOTE: In-memory timer — cancelled if the bot restarts before it fires.
  setTimeout(async () => {
    try {
      const guild = interaction.guild;
      if (!guild) return;

      const freshMember = await guild.members.fetch(member.id);
      if (!memberHasRole(freshMember, nextRoleId)) {
        await freshMember.roles.add(nextRoleId);
      }

      // Best-effort DM so the user notices the unlock without channel spam
      try {
        await freshMember.send(texts.unlockNotice);
      } catch {
        // DMs closed — role grant is enough; channel permissions will reveal content
      }
    } catch (err) {
      console.error(`Failed to unlock Day ${day + 1} for ${member.id}:`, err);
    } finally {
      pendingUnlocks.delete(key);
    }
  }, config.UNLOCK_DELAY_MS);
}

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  console.log(
    `Unlock delay: ${config.UNLOCK_DELAY_MS}ms. Timers are in-memory and reset if the bot restarts.`
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const name = interaction.commandName;

      if (!['testday1', 'testday2', 'testday3'].includes(name)) return;

      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({
          content: 'Only administrators can post course day messages.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const day = Number(name.replace('testday', ''));
      await postDayEmbed(interaction, day);
      return;
    }

    if (interaction.isButton()) {
      const id = interaction.customId;

      if (id === config.days[1].completeCustomId) {
        await handleDayComplete(interaction, 1);
        return;
      }
      if (id === config.days[2].completeCustomId) {
        await handleDayComplete(interaction, 2);
        return;
      }
      if (id === config.days[3].completeCustomId) {
        await handleDayComplete(interaction, 3);
        return;
      }
    }
  } catch (err) {
    console.error('Interaction error:', err);
    const payload = {
      content: 'Something went wrong handling that interaction.',
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
