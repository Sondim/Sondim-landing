require('dotenv').config();

function envValue(name) {
    const value = process.env[name];
    if (value == null || value === '') return '';
    // Strip CRLF / stray whitespace from Windows-edited .env files on Linux hosts.
    return value.trim();
}

function required(name) {
    const value = envValue(name);
    if (!value) {
        throw new Error(`Missing ${name}. Add it in discord-bot/.env (the file you upload to Discloud).`);
    }
    return value;
}

function optional(name) {
    return envValue(name);
}

const config = {
    token: required('DISCORD_TOKEN'),
    clientId: required('DISCORD_CLIENT_ID'),
    guildId: required('DISCORD_GUILD_ID'),
    roles: {
        day1: required('ROLE_DAY1'),
        day2: required('ROLE_DAY2'),
        day3: required('ROLE_DAY3'),
        alumni: required('ROLE_ALUMNI'),
    },
    channels: {
        startHere: required('CHANNEL_START_HERE'),
        intro: {
            1: required('CHANNEL_DAY1'),
            2: required('CHANNEL_DAY2'),
            3: required('CHANNEL_DAY3'),
        },
        resources: {
            1: optional('CHANNEL_RESOURCES_DAY1'),
            2: optional('CHANNEL_RESOURCES_DAY2'),
            3: optional('CHANNEL_RESOURCES_DAY3'),
        },
        log: optional('CHANNEL_LOG'),
        courseDiscussion: optional('CHANNEL_COURSE_DISCUSSION') || '1526212880729641202',
        gradCategory: optional('CATEGORY_GRAD'),
        gradChat: required('CHANNEL_GRAD_CHAT'),
        gradVoice: optional('CHANNEL_GRAD_VOICE'),
        selfPromotion: optional('CHANNEL_SELF_PROMOTION'),
    },
};

module.exports = { config };
