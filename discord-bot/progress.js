const {
    ChannelType,
    ThreadAutoArchiveDuration,
} = require('discord.js');
const { config } = require('./config');

function hasRole(member, roleId) {
    return member.roles.cache.has(roleId);
}

async function respond(interaction, content) {
    if (interaction.deferred || interaction.replied) {
        return interaction.editReply({ content });
    }
    return interaction.reply({ content, ephemeral: true });
}

function permissionHint(error) {
    const text = String(error);
    if (text.includes('Missing Permissions') || text.includes('50013')) {
        return ' The bot role must sit **above** Day 1 / Day 2 / Day 3 / Alumni, and it needs Manage Roles + Create Private Threads.';
    }
    if (text.includes('Missing Access') || text.includes('50001')) {
        return ' The bot cannot see that channel. Give it View Channel + Send Messages + Create Private Threads there.';
    }
    return '';
}

async function logEvent(client, message) {
    const logId = config.channels.log;
    if (!logId) return;
    const channel = await client.channels.fetch(logId).catch(() => null);
    if (!channel?.isTextBased()) return;
    await channel.send({ content: message.slice(0, 1900) }).catch(() => {});
}

async function pingInPrivateThread(channel, member, dayNumber, body) {
    const thread = await channel.threads.create({
        name: `Day ${dayNumber} — ${member.displayName}`.slice(0, 100),
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        type: ChannelType.PrivateThread,
        invitable: false,
        reason: `Course ping for Day ${dayNumber}`,
    });

    await thread.members.add(member.id);
    await thread.send({
        content: `${member} ${body}`,
        allowedMentions: { users: [member.id] },
    });

    return thread;
}

async function unlockDay(interaction, dayNumber) {
    const member = interaction.member;
    const roleId = config.roles[`day${dayNumber}`];
    const introChannel = await interaction.client.channels.fetch(config.channels.intro[dayNumber]);

    if (!introChannel?.isTextBased()) {
        throw new Error(`Day ${dayNumber} intro channel is missing or not a text channel.`);
    }

    if (!hasRole(member, roleId)) {
        await member.roles.add(roleId, `Unlocked Day ${dayNumber}`);
    }

    const resourcesId = config.channels.resources[dayNumber];
    await pingInPrivateThread(
        introChannel,
        member,
        dayNumber,
        `Day ${dayNumber} is open.\n\n1. Read the pinned intro in this channel.\n2. Then open <#${resourcesId}> and do the work.\n3. When you are finished, press **I'm done with Day ${dayNumber}**.`
    );

    await logEvent(
        interaction.client,
        `Unlocked Day ${dayNumber} for ${member.user.tag} (${member.id})`
    );
}

async function startDay1(interaction) {
    if (hasRole(interaction.member, config.roles.day1)) {
        await respond(interaction, `Day 1 is already unlocked. Open <#${config.channels.intro[1]}>.`);
        return;
    }

    await unlockDay(interaction, 1);
    await respond(interaction, `Day 1 is unlocked. Check the mention in <#${config.channels.intro[1]}>.`);
}

async function completeDay(interaction, finishedDay) {
    const member = interaction.member;
    const currentRole = config.roles[`day${finishedDay}`];

    if (!hasRole(member, currentRole)) {
        await respond(interaction, `You still need Day ${finishedDay} first. Start from <#${config.channels.startHere}>.`);
        return;
    }

    if (finishedDay === 3) {
        if (hasRole(member, config.roles.alumni)) {
            await respond(interaction, 'You already finished the 3-day course. You can still reread any day.');
            return;
        }

        await member.roles.add(config.roles.alumni, 'Finished 3-day course');
        const day3 = await interaction.client.channels.fetch(config.channels.intro[3]);
        await pingInPrivateThread(
            day3,
            member,
            3,
            'You finished the 3-day course. You keep access to every day — come back whenever you want.\n\nIf you want more of this later, tell Magnus in #general.'
        );
        await logEvent(interaction.client, `Alumni: ${member.user.tag} (${member.id})`);
        await respond(interaction, 'You finished the course. Check the mention in the Day 3 channel.');
        return;
    }

    const nextDay = finishedDay + 1;
    const nextRole = config.roles[`day${nextDay}`];

    if (hasRole(member, nextRole)) {
        await respond(interaction, `You already have Day ${nextDay}. Open <#${config.channels.intro[nextDay]}>.`);
        return;
    }

    await unlockDay(interaction, nextDay);
    await respond(interaction, `Day ${nextDay} is unlocked. Check the mention in <#${config.channels.intro[nextDay]}>.`);
}

module.exports = {
    permissionHint,
    startDay1,
    completeDay,
    logEvent,
};
