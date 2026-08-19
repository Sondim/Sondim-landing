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
} = require('discord.js');
const { config } = require('./config');
const { permissionHint, startDay1, completeDay, logEvent } = require('./progress');

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
    .setDescription('Post the Start and Done buttons (staff only).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON();

function startRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('start-day-1')
            .setLabel('Start Day 1')
            .setStyle(ButtonStyle.Success)
    );
}

function doneRow(day) {
    const label = day === 3 ? 'Complete course' : `I'm done with Day ${day}`;
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`done-day-${day}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Primary)
    );
}

function introReadRow(day) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`read-intro-day-${day}`)
            .setLabel("I've read the intro")
            .setStyle(ButtonStyle.Primary)
    );
}

async function findBotButtonMessage(channel, customId) {
    const messages = await channel.messages.fetch({ limit: 50 });
    return messages.find((message) => {
        if (message.author.id !== client.user.id) return false;
        return message.components.some((row) =>
            row.components.some((component) => component.customId === customId)
        );
    });
}

async function upsertButtonMessage(channel, customId, payload) {
    const existing = await findBotButtonMessage(channel, customId);
    if (existing) {
        await existing.edit(payload);
        return existing;
    }
    return channel.send(payload);
}

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: [setupCommand] }
    );
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        await registerCommands();
        console.log('Registered /setup for this server');
    } catch (error) {
        console.error('Could not register /setup', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand() && interaction.commandName === 'setup') {
            await runSetup(interaction);
            return;
        }

        if (!interaction.isButton()) return;

        await interaction.deferReply({ ephemeral: true });

        if (interaction.customId === 'start-day-1') {
            await startDay1(interaction);
            return;
        }

        const doneMatch = interaction.customId.match(/^done-day-([123])$/);
        if (doneMatch) {
            await completeDay(interaction, Number(doneMatch[1]));
            return;
        }

        const introReadMatch = interaction.customId.match(/^read-intro-day-([123])$/);
        if (introReadMatch) {
            const day = Number(introReadMatch[1]);
            await interaction.editReply({
                content: [
                    `Nice — you're set for Day ${day}.`,
                    `Go to <#${config.channels.resources[day]}> for the work.`,
                ].join('\n'),
            });
        }
    } catch (error) {
        console.error(error);
        const hint = permissionHint(error);
        const text = `Something went wrong.${hint}\n\`${String(error.message || error).slice(0, 400)}\``;
        await logEvent(client, `Error for ${interaction.user?.tag}: ${error.stack || error}`);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: text }).catch(() => {});
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
                await channel.delete('Replaced by DM approach');
                removed.push(channel.id);
            } catch (e) {
                // ignore if can't delete
            }
        }
    }
    return removed;
}

async function runSetup(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const startChannel = await requireTextChannel('#start-here', config.channels.startHere);
    await upsertButtonMessage(startChannel, 'start-day-1', {
        content: [
            '**Free 3-day course**',
            'You will only see **Day 1** until you finish it.',
            'Press the button when you are ready.',
        ].join('\n'),
        components: [startRow()],
    });

    for (const day of [1, 2, 3]) {
        const intro = await requireTextChannel(`#day-${day}`, config.channels.intro[day]);
        await upsertButtonMessage(intro, `read-intro-day-${day}`, {
            content: `When you've read the pinned intro for Day ${day}, press the button below.`,
            components: [introReadRow(day)],
        });

        const resources = await requireTextChannel(
            `#resources-day-${day}`,
            config.channels.resources[day]
        );
        const next = day === 3 ? 'complete the course' : `unlock Day ${day + 1}`;
        await upsertButtonMessage(resources, `done-day-${day}`, {
            content: [
                `If you have any questions or reflections about this day, post in <#${config.channels.courseDiscussion}>.`,
                `When you have done the reading / video / workshop, press the button to ${next}.`,
            ].join('\n\n'),
            components: [doneRow(day)],
        });
    }

    const removed = await cleanupBriefingChannels(interaction.guild);
    const cleanupNote = removed.length > 0
        ? `\nRemoved ${removed.length} old #your-briefing channel(s).`
        : '';

    await interaction.editReply({
        content: `Buttons are posted (or updated) in #start-here and each resources channel. Unlock confirmations are shown privately on button press.${cleanupNote}`,
    });
}

client.login(config.token);
