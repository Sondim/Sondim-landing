const fs = require('fs');
const path = require('path');
const { ChannelType } = require('discord.js');

const DATA_FILE = path.join(__dirname, 'data', 'progress.json');

function loadProgress() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveProgress(data) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function progressKey(userId, day) {
    return `${userId}:${day}`;
}

function getUserDayProgress(userId, day) {
    return loadProgress()[progressKey(userId, day)] || null;
}

function setUserDayProgress(userId, day, update) {
    const data = loadProgress();
    const key = progressKey(userId, day);
    data[key] = { ...(data[key] || {}), ...update };
    saveProgress(data);
    return data[key];
}

function clearUserProgress(userId) {
    const data = loadProgress();
    const threadIds = [];

    for (const day of [1, 2, 3]) {
        const key = progressKey(userId, day);
        if (data[key]?.threadId) {
            threadIds.push(data[key].threadId);
        }
        delete data[key];
    }

    saveProgress(data);
    return threadIds;
}

function courseThreadPrefix(day) {
    return `Level ${day} —`;
}

function legacyCourseThreadPrefix(day) {
    return `Day ${day} —`;
}

function isCourseThreadForLevel(thread, day) {
    return thread.name.startsWith(courseThreadPrefix(day))
        || thread.name.startsWith(legacyCourseThreadPrefix(day));
}

async function isThreadMember(thread, userId) {
    try {
        await thread.members.fetch(userId);
        return true;
    } catch {
        return false;
    }
}

async function fetchAllChannelThreads(channel) {
    const threads = new Map();

    const active = await channel.threads.fetchActive().catch(() => null);
    if (active) {
        for (const [, thread] of active.threads) {
            threads.set(thread.id, thread);
        }
    }

    const archived = await channel.threads.fetchArchived({ fetchAll: true }).catch(() => null);
    if (archived) {
        for (const [, thread] of archived.threads) {
            threads.set(thread.id, thread);
        }
    }

    return [...threads.values()];
}

async function findStudentCourseThreads(client, member) {
    const { config } = require('./config');
    const found = [];
    const seen = new Set();

    for (const day of [1, 2, 3]) {
        const channel = await client.channels.fetch(config.channels.intro[day]).catch(() => null);
        if (!channel?.threads) continue;

        const channelThreads = await fetchAllChannelThreads(channel);
        for (const thread of channelThreads) {
            if (!isCourseThreadForLevel(thread, day)) continue;
            if (seen.has(thread.id)) continue;
            if (!(await isThreadMember(thread, member.id))) continue;
            seen.add(thread.id);
            found.push(thread);
        }
    }

    return found;
}

async function findExistingStudentThread(channel, member, day) {
    const channelThreads = await fetchAllChannelThreads(channel);

    for (const thread of channelThreads) {
        if (!isCourseThreadForLevel(thread, day)) continue;
        if (!(await isThreadMember(thread, member.id))) continue;

        if (thread.archived) {
            await thread.setArchived(false).catch(() => {});
        }
        await thread.members.add(member.id).catch(() => {});
        return thread;
    }

    return null;
}

async function getOrCreatePrivateThread(channel, member, day) {
    const existing = getUserDayProgress(member.id, day);

    if (existing?.threadId) {
        const thread = await channel.client.channels.fetch(existing.threadId).catch(() => null);
        if (thread?.isThread()) {
            if (thread.archived) {
                await thread.setArchived(false);
            }
            await thread.members.add(member.id).catch(() => {});
            return thread;
        }
    }

    const reused = await findExistingStudentThread(channel, member, day);
    if (reused) {
        setUserDayProgress(member.id, day, {
            threadId: reused.id,
            postedUpTo: existing?.postedUpTo ?? 0,
        });
        return reused;
    }

    const name = `${courseThreadPrefix(day)} ${member.displayName}`.slice(0, 100);
    const thread = await channel.threads.create({
        name,
        autoArchiveDuration: 10080,
        type: ChannelType.PrivateThread,
        reason: `Course Level ${day} for ${member.user.tag}`,
    });

    await thread.members.add(member.id);
    setUserDayProgress(member.id, day, { threadId: thread.id, postedUpTo: 0 });
    return thread;
}

module.exports = {
    getUserDayProgress,
    setUserDayProgress,
    getOrCreatePrivateThread,
    findStudentCourseThreads,
    clearUserProgress,
};
