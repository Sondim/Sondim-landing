/**
 * Discord channel and role IDs for the 3-day course.
 * Change these if you recreate channels/roles in Discord.
 */
module.exports = {
  // Unlock delay after completing a day (1 minute for testing).
  // Change to 24 * 60 * 60 * 1000 for a real 24-hour course.
  UNLOCK_DELAY_MS: 60_000,

  days: {
    1: {
      channelId: '1526284554359406642',
      // Day 1 access role (assigned outside this bot / manually if needed)
      roleId: '1526283207308214273',
      completeCustomId: 'day1_complete',
      nextRoleId: '1526283382781378580', // Day 2 role granted after delay
    },
    2: {
      channelId: '1526284609145540708',
      roleId: '1526283382781378580',
      completeCustomId: 'day2_complete',
      nextRoleId: '1526283527077888041', // Day 3 role granted after delay
    },
    3: {
      channelId: '1529468705300283503',
      roleId: '1526283527077888041',
      completeCustomId: 'day3_complete',
      // Course completion role (granted immediately on Day 3 complete)
      nextRoleId: '1526283565489459365',
    },
  },

  completionRoleId: '1526283565489459365',
};
