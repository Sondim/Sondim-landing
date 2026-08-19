const { config } = require('./config');

function hasRole(member, roleId) {
    return member.roles.cache.has(roleId);
}

async function respond(interaction, payload) {
    const data = typeof payload === 'string' ? { content: payload } : payload;
    if (interaction.deferred || interaction.replied) {
        return interaction.editReply(data);
    }
    return interaction.reply({ ...data, ephemeral: true });
}

function permissionHint(error) {
    const text = String(error);
    if (text.includes('Missing Permissions') || text.includes('50013')) {
        return ' The bot role must sit **above** Day 1 / Day 2 / Day 3 / Alumni, and it needs Manage Roles.';
    }
    if (text.includes('Missing Access') || text.includes('50001')) {
        return ' The bot cannot see that channel. Give it View Channel + Send Messages there.';
    }
    return '';
}

function stepError(step, context, error) {
    const label = context?.name ? `#${context.name} (${context.id || '?'})` : String(context);
    const wrapped = new Error(`${step} on ${label}: ${error.message || error}`);
    wrapped.cause = error;
    wrapped.step = step;
    return wrapped;
}

async function logEvent(client, message) {
    const logId = config.channels.log;
    if (!logId) return;
    const channel = await client.channels.fetch(logId).catch(() => null);
    if (!channel?.isTextBased()) return;
    await channel.send({ content: message.slice(0, 1900) }).catch(() => {});
}

const PHIBI_CONGRATS = '783788733987815434';

async function welcomeToGradChat(client, member) {
    const channel = await client.channels.fetch(config.channels.gradChat).catch(() => null);
    if (!channel?.isTextBased()) {
        await logEvent(client, `Grad welcome skipped: #grad-chat missing`);
        return;
    }

    const payload = {
        content: `${member} just finished the free course. Come say hi!`,
        allowedMentions: { users: [member.id] },
        stickers: [PHIBI_CONGRATS],
    };

    try {
        await channel.send(payload);
    } catch (error) {
        await logEvent(client, `Grad welcome sticker failed, sending text only: ${error}`);
        await channel.send({
            content: payload.content,
            allowedMentions: payload.allowedMentions,
        }).catch(() => {});
    }
}

async function unlockDay(interaction, dayNumber) {
    const member = interaction.member;
    const roleId = config.roles[`day${dayNumber}`];

    if (!hasRole(member, roleId)) {
        try {
            await member.roles.add(roleId, `Unlocked Day ${dayNumber}`);
        } catch (error) {
            throw stepError(`add Day ${dayNumber} role`, { name: 'roles', id: roleId }, error);
        }
    }

    await logEvent(
        interaction.client,
        `Unlocked Day ${dayNumber} for ${member.user.tag} (${member.id})`
    );
}

function unlockReply(dayNumber) {
    const introMention = `<#${config.channels.intro[dayNumber]}>`;
    return [`Day ${dayNumber} is unlocked.`, `Open ${introMention} and read the pinned intro.`].join('\n');
}

async function startDay1(interaction) {
    if (hasRole(interaction.member, config.roles.day1)) {
        await respond(interaction, `Day 1 is already unlocked. Open <#${config.channels.intro[1]}>.`);
        return;
    }

    await unlockDay(interaction, 1);
    await respond(interaction, unlockReply(1));
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
            await respond(
                interaction,
                `You already finished the 3-day course. Hang out in <#${config.channels.gradChat}>.`
            );
            return;
        }

        try {
            await member.roles.add(config.roles.alumni, 'Finished 3-day course');
        } catch (error) {
            throw stepError('add Alumni role', { name: 'alumni', id: config.roles.alumni }, error);
        }

        await logEvent(interaction.client, `Alumni: ${member.user.tag} (${member.id})`);
        await welcomeToGradChat(interaction.client, member);

        const promoBit = config.channels.selfPromotion
            ? `If you want to share your game or work, post in <#${config.channels.selfPromotion}>.`
            : '';
        await respond(
            interaction,
            [
                '# 🥳 You\'ve completed the course! 🥳',
                '',
                `You finished the course! I hope it's been helpful for you. Please say hello in <#${config.channels.gradChat}> for other people who've done the course!`,
                promoBit.trim(),
            ].filter(Boolean).join('\n')
        );
        return;
    }

    const nextDay = finishedDay + 1;
    const nextRole = config.roles[`day${nextDay}`];

    if (hasRole(member, nextRole)) {
        await respond(interaction, `You already have Day ${nextDay}. Open <#${config.channels.intro[nextDay]}>.`);
        return;
    }

    await unlockDay(interaction, nextDay);
    await respond(interaction, unlockReply(nextDay));
}

module.exports = {
    permissionHint,
    startDay1,
    completeDay,
    logEvent,
};
