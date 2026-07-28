/**
 * Registers /testday1, /testday2, /testday3 slash commands.
 * Run once (or after command changes): npm run register
 */
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env');
  process.exit(1);
}

const commands = [1, 2, 3].map((day) =>
  new SlashCommandBuilder()
    .setName(`testday${day}`)
    .setDescription(`Post the Day ${day} course embed (admin only)`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    if (guildId) {
      console.log(`Registering guild commands to ${guildId}...`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('Guild slash commands registered.');
    } else {
      console.log('Registering global commands (may take up to ~1 hour to appear)...');
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('Global slash commands registered.');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
