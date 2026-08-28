const {
    Client,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const { config } = require('./config');
const {
    permissionHint,
    startDay1,
    completeDay,
    logEvent,
    hasRequiredDayRole,
    resetStudentProgress,
} = require('./progress');
const {
    buildChannelIntroPayload,
    buildThreadStepPayload,
    parseStepCustomId,
    getFinalStepNumber,
    stepCustomId,
    getChannelIntroMarker,
    getLegacyChannelIntroMarkers,
    START_HERE_MARKER,
} = require('./content');
const {
    getUserDayProgress,
    setUserDayProgress,
    getOrCreatePrivateThread,
} = require('./threads');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.Channel],
});

const setupCommand = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Post course buttons in #start-here and each day channel (staff only).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON();

const resetProgressCommand = new SlashCommandBuilder()
    .setName('reset-progress')
    .setDescription('Wipe a student\'s course roles, bot progress, and private threads (staff only).')
    .addUserOption((option) =>
        option
            .setName('student')
            .setDescription('Who to reset (defaults to you)')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON();

function startRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start-day-1')
            .setLabel('Start Level 1')
            .setStyle(ButtonStyle.Success)
    );
}

const LEGACY_INTRO_BUTTON_IDS = {
    1: ['read-intro-day-1', 'done-day-1'],
    2: ['read-intro-day-2', 'done-day-2'],
    3: ['read-intro-day-3', 'done-day-3'],
};

function messageButtonCustomIds(message) {
    return message.components.flatMap((row) =>
        row.components.map((component) => component.customId)
    );
}

function isBotCourseIntroMessage(message, day) {
    if (message.author.id !== client.user.id) return false;

    const marker = getChannelIntroMarker(day);
    const legacyMarkers = getLegacyChannelIntroMarkers(day);
    if ([marker, ...legacyMarkers].some((text) => (message.content || '').includes(text))) {
        return true;
    }

    if (!message.components?.length) return false;

    const customIds = messageButtonCustomIds(message);
    const currentId = stepCustomId(day, 1);
    const legacyIds = LEGACY_INTRO_BUTTON_IDS[day] || [];

    return customIds.some((id) => id === currentId || legacyIds.includes(id));
}

function isBotStartMessage(message) {
    if (message.author.id !== client.user.id) return false;

    if ((message.content || '').includes(START_HERE_MARKER)) return true;
    if ((message.content || '').includes('Free 3-day course')) return true;

    if (!message.components?.length) return false;

    return messageButtonCustomIds(message).includes('start-day-1');
}

async function findBotCourseIntroMessage(channel, day) {
    const matches = await findAllBotCourseIntroMessages(channel, day);
    if (matches.length === 0) return null;

    return matches.reduce((oldest, message) =>
        message.createdTimestamp < oldest.createdTimestamp ? message : oldest
    );
}

async function findAllBotCourseIntroMessages(channel, day) {
    const messages = await channel.messages.fetch({ limit: 100 });
    return [...messages.values()].filter((message) => isBotCourseIntroMessage(message, day));
}

async function findBotStartMessage(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });
    const matches = [...messages.values()].filter((message) => isBotStartMessage(message));
    if (matches.length === 0) return null;

    return matches.reduce((oldest, message) =>
        message.createdTimestamp < oldest.createdTimestamp ? message : oldest
    );
}

function silentPayload(payload, { suppressNotification = false } = {}) {
    return {
        ...payload,
        allowedMentions: { parse: [] },
        ...(suppressNotification ? { flags: MessageFlags.SuppressNotifications } : {}),
    };
}

async function removeDuplicateBotMessages(channel, keepMessageId, isMatch) {
    const messages = await channel.messages.fetch({ limit: 100 });

    for (const [, message] of messages) {
        if (message.id === keepMessageId || !isMatch(message)) continue;
        await message.delete().catch(() => {});
    }
}

async function upsertCourseMessage(channel, { findMessage, isMatch, payload }) {
    const existing = await findMessage(channel);
    const safePayload = silentPayload({ ...payload, embeds: [] });

    if (existing) {
        await existing.edit(safePayload);
        await removeDuplicateBotMessages(channel, existing.id, isMatch);
        return existing;
    }

    const sent = await channel.send(silentPayload({ ...payload, embeds: [] }, { suppressNotification: true }));
    await removeDuplicateBotMessages(channel, sent.id, isMatch);
    return sent;
}

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: [setupCommand, resetProgressCommand] }
    );
}

const STEP_DONE_MARK = '✅';

async function getButtonMessage(interaction) {
    let message = interaction.message;
    if (!message) return null;
    if (message.partial) {
        message = await message.fetch();
    }
    return message;
}

function markedContent(content) {
    const text = content || '';
    if (text.includes(STEP_DONE_MARK)) return text;
    return `${text}\n\n${STEP_DONE_MARK}`;
}

function buildMarkPayload(message) {
    return {
        components: [],
        content: markedContent(message.content),
        embeds: [],
    };
}

async function markStepComplete(interaction) {
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate();
    }

    const message = await getButtonMessage(interaction);
    if (!message?.editable || message.author?.id !== client.user.id) return;

    const payload = buildMarkPayload(message);
    await message.edit(payload);
}

async function handleCourseStep(interaction, day, step) {
    if (!hasRequiredDayRole(interaction.member, day)) {
        await interaction.followUp({
            content: `You need access to Level ${day} first. Start from <#${config.channels.startHere}>.`,
            ephemeral: true,
        });
        return;
    }

    const finalStep = getFinalStepNumber(day);

    if (step === finalStep) {
        await completeDay(interaction, day);
        return;
    }

    const parentChannel = interaction.channel.isThread()
        ? interaction.channel.parent
        : interaction.channel;

    if (!parentChannel) {
        throw new Error('Could not find parent channel for course thread.');
    }

    const thread = await getOrCreatePrivateThread(parentChannel, interaction.member, day);
    const progress = getUserDayProgress(interaction.user.id, day) || { postedUpTo: 0 };

    if (progress.postedUpTo >= step) {
        await interaction.followUp({
            content: `You already have this step in your private thread: ${thread}. Open it to continue.`,
            ephemeral: true,
        });
        return;
    }

    if (step !== progress.postedUpTo + 1) {
        await interaction.followUp({
            content: `Continue from your private thread: ${thread}. Press the latest button there.`,
            ephemeral: true,
        });
        return;
    }

    const payload = buildThreadStepPayload(day, step - 1);
    await thread.send(payload);
    setUserDayProgress(interaction.user.id, day, { threadId: thread.id, postedUpTo: step });

    if (step === 1) {
        await interaction.followUp({
            content: [
                `Your private Level ${day} thread is ready: ${thread}`,
                'The first step is posted there — only you can see it.',
            ].join('\n'),
            ephemeral: true,
        });
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await registerCommands();
        console.log('Registered /setup and /reset-progress for this server');
    } catch (error) {
        console.error('Could not register /setup', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild) return;

    try {
        if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
            await runSetup(interaction);
            return;
        }

        if (interaction.isChatInputCommand() && interaction.commandName === 'reset-progress') {
            await runResetProgress(interaction);
            return;
        }

        if (!interaction.isButton()) return;

        if (interaction.customId === 'start-day-1') {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
            await startDay1(interaction);
            return;
        }

        const parsed = parseStepCustomId(interaction.customId);
        if (parsed) {
            if (interaction.channel.isThread()) {
                await markStepComplete(interaction);
            } else if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
            await handleCourseStep(interaction, parsed.day, parsed.step);
        }
    } catch (error) {
        console.error(error);
        const hint = permissionHint(error);
        const text = `Something went wrong.${hint}\n\`${String(error.message || error).slice(0, 400)}\``;
        await logEvent(client, `Error for ${interaction.user?.tag}: ${error.stack || error}`);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: text }).catch(() =>
                interaction.followUp({ content: text, ephemeral: true }).catch(() => {})
            );
        } else {
            await interaction.reply({ content: text, ephemeral: true }).catch(() => {});
        }
    }
});

async function requireTextChannel(label, id) {
    let channel;
    try {
        channel = await client.channels.fetch(id);
    } catch (error) {
        const wrapped = new Error(`${label} (${id}): ${error.message}`);
        wrapped.cause = error;
        throw wrapped;
    }
    if (!channel) {
        throw new Error(`${label} (${id}): channel not found. Check the ID.`);
    }
    return channel;
}

async function cleanupBriefingChannels(guild) {
    const removed = [];
    await guild.channels.fetch();
    for (const [, channel] of guild.channels.cache) {
        if (channel.name === 'your-briefing' && channel.isTextBased() && !channel.isThread()) {
            try {
                await channel.delete('Replaced by private thread approach');
                removed.push(channel.id);
            } catch (e) {
                // ignore if can't delete
            }
        }
    }
    return removed;
}

async function runResetProgress(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('student') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
        await interaction.editReply({ content: 'Could not find that member in this server.' });
        return;
    }

    const { removedRoles, deletedThreads } = await resetStudentProgress(interaction.client, member);

    await interaction.editReply({
        content: [
            `Reset **${member.displayName}** (${member.id}).`,
            `Removed **${removedRoles}** course role(s).`,
            `Deleted **${deletedThreads.length}** private thread(s).`,
            '',
            'They can press **Start Level 1** again from a clean slate.',
            'Run `/setup` only if button messages need refreshing — not required for reset.',
        ].join('\n'),
    });
}

async function runSetup(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const startChannel = await requireTextChannel('#start-here', config.channels.startHere);
    await upsertCourseMessage(startChannel, {
        findMessage: findBotStartMessage,
        isMatch: isBotStartMessage,
        payload: {
            content: [
                '**Free 3-level course**',
                'Press the button when you are ready.',
            ].join('\n'),
            components: [startRow()],
        },
    });

    for (const day of [1, 2, 3]) {
        const intro = await requireTextChannel(`#day-${day}`, config.channels.intro[day]);
        const payload = buildChannelIntroPayload(day);
        await upsertCourseMessage(intro, {
            findMessage: (channel) => findBotCourseIntroMessage(channel, day),
            isMatch: (message) => isBotCourseIntroMessage(message, day),
            payload,
        });
    }

    const removed = await cleanupBriefingChannels(interaction.guild);
    const cleanupNote = removed.length > 0
        ? `\nRemoved ${removed.length} old #your-briefing channel(s).`
        : '';

    await interaction.editReply({
        content: [
            'Course buttons updated in **#start-here** and the three level channels (existing messages edited in place — no channel pings).',
            'Duplicate bot intro posts, if any, were removed.',
            cleanupNote.trim(),
        ].filter(Boolean).join('\n'),
    });
}

client.login(config.token);
