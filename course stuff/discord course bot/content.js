const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const config = require('./config');

// =============================================================================
// EDIT DAY 1 TEXT HERE
// =============================================================================
const day1 = {
  embed: () =>
    new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('Day 1 — Welcome')
      .setDescription(
        [
          'Welcome to the course!',
          '',
          'This is **Day 1** placeholder content. Replace this copy with your real lesson.',
          '',
          'When you are finished reading, click **Complete Day 1** below.',
        ].join('\n')
      )
      .setFooter({ text: 'Progressive disclosure course · Day 1' }),

  buttonLabel: 'Complete Day 1',
  alreadyDone: 'You have already completed Day 1 (or Day 2 is already unlocking).',
  confirm: 'Day 1 completed! Day 2 will unlock in 1 minute.',
  unlockNotice: 'Day 2 is now unlocked — check the Day 2 channel.',
};

// =============================================================================
// EDIT DAY 2 TEXT HERE
// =============================================================================
const day2 = {
  embed: () =>
    new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('Day 2 — Next Steps')
      .setDescription(
        [
          'Welcome to **Day 2**.',
          '',
          'This is Day 2 placeholder content. Swap this text when your lesson is ready.',
          '',
          'When you are finished, click **Complete Day 2** below.',
        ].join('\n')
      )
      .setFooter({ text: 'Progressive disclosure course · Day 2' }),

  buttonLabel: 'Complete Day 2',
  alreadyDone: 'You have already completed Day 2 (or Day 3 is already unlocking).',
  confirm: 'Day 2 completed! Day 3 will unlock in 1 minute.',
  unlockNotice: 'Day 3 is now unlocked — check the Day 3 channel.',
};

// =============================================================================
// EDIT DAY 3 TEXT HERE
// =============================================================================
const day3 = {
  embed: () =>
    new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('Day 3 — Final Lesson')
      .setDescription(
        [
          'Welcome to **Day 3** — the final day.',
          '',
          'This is Day 3 placeholder content. Replace with your closing lesson.',
          '',
          'When you are finished, click **Complete Day 3** below.',
        ].join('\n')
      )
      .setFooter({ text: 'Progressive disclosure course · Day 3' }),

  buttonLabel: 'Complete Day 3',
  alreadyDone: 'You have already completed the course.',
  confirm:
    'Congratulations — you finished the 3-day course! Your completion role has been added.',
};

const byDay = { 1: day1, 2: day2, 3: day3 };

/**
 * Build the message payload (embed + green complete button) for a course day.
 * @param {1|2|3} day
 */
function buildDayMessage(day) {
  const content = byDay[day];
  const dayConfig = config.days[day];

  const button = new ButtonBuilder()
    .setCustomId(dayConfig.completeCustomId)
    .setLabel(content.buttonLabel)
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  return {
    embeds: [content.embed()],
    components: [row],
  };
}

module.exports = {
  day1,
  day2,
  day3,
  byDay,
  buildDayMessage,
};
