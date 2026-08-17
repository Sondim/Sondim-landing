require('dotenv').config();

function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ${name}. Add it in Railway Variables (or discord-bot/.env locally).`);
    }
    return value;
}

function optional(name) {
    return process.env[name] || '';
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
            1: required('CHANNEL_RESOURCES_DAY1'),
            2: required('CHANNEL_RESOURCES_DAY2'),
            3: required('CHANNEL_RESOURCES_DAY3'),
        },
        log: optional('CHANNEL_LOG'),
    },
};

module.exports = { config };
