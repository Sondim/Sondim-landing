const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Visual separator above each step. Body text lives in message content (full size).
const STEP_SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

// =============================================================================
// EDIT COURSE COPY HERE
// =============================================================================

const LINKS = {
    innerCriticTest: 'https://sondim.github.io/test/innercritic/',
    voiceWorkshop: 'https://sondim.github.io/workshops/The%20voice%20in%20your%20head/index.html',
    videoDay1Intro: 'https://youtu.be/jG7dSXcfVqE',
    // Swap this when you have the final Day 1 step-4 video:
    videoDay1Part2: process.env.VIDEO_DAY1_2 || 'https://www.youtube.com/watch?v=ZeIShRO_8NE',
    videoDay2: process.env.VIDEO_DAY2 || 'https://www.youtube.com/watch?v=rvwugeJDUZc',
    videoDay3: process.env.VIDEO_DAY3 || 'https://www.youtube.com/watch?v=eX4d7wIOvuM',
};

const days = {
    1: {
        channelIntro: {
            lines: [
                '**Welcome to Level 1**',
                '',
                "I'm so glad you're here! 😊 ✨ This is a bot version of me that will guide you through this course, but if you have any questions for me personally just throw me a DM!",
                '',
                'This is level 1 out of 3 levels. You can complete each step and level at your own pace and Discord saves your progress.',
                '',
                'Above {{LEVEL_CHANNEL}} you can see a public {{DISCUSSION_CHANNEL}} channel for this course, which I encourage you to ask your questions in!',
                '',
                "I hope you'll find this course useful.",
                '',
                "When you've read the intro above, press the button below.",
            ],
            buttonLabel: "I've read the intro",
        },
        threadSteps: [
            {
                lines: [
                    '**Watch the video below**',
                    '',
                    'Before we *do a test* to see what your own self-talk looks like, I want to talk about some important things.',
                    '',
                    ':interrobang: What is critical self talk? What isn\'t it? And why do we have it?',
                    '',
                    "When you've watched the video, press the button below.",
                ],
                videoUrl: LINKS.videoDay1Intro,
                buttonLabel: "I've watched the video",
            },
            {
                lines: [
                    '**Inner critic test**',
                    '',
                    'Getting a better understanding of what your self-talk sounds like is a *super important* first step.',
                    '',
                    'In this test below :point_down: we\'ll identify your type which can help you understand what that voice is trying to do.',
                    '',
                    ':warning: This test is meant for self-reflection, it\'s not a tool for diagnosis. If it becomes overwhelming, respect your own boundaries and step away for a breath.',
                    '',
                    `### :link: Take the test here:\n${LINKS.innerCriticTest}`,
                    '',
                    "Once you've completed the test, come back here and press Continue.",
                ],
                buttonLabel: 'Continue',
            },
            {
                lines: [
                    '**One more video**',
                    '',
                    'Not all self-talk is critical. This video helps separate normal introspection from the inner critic.',
                    '',
                    "When you've watched the video, press the button below.",
                ],
                videoUrl: LINKS.videoDay1Part2,
                buttonLabel: "I've watched the video",
            },
            {
                lines: [
                    '**Workshop: The voice in your head**',
                    '',
                    "You've looked at what the inner critic is and mapped your own. Now let's look at how that voice shows up in practice.",
                    '',
                    `Open the workshop: ${LINKS.voiceWorkshop}`,
                    '',
                    "When you've done the workshop, press the button below.",
                ],
                buttonLabel: 'Wrap up Level 1',
            },
            {
                lines: [
                    '**Nice work — Level 1 is done.**',
                    '',
                    "If you stop here, it's easy to fall into a common trap: fighting fire with fire. The inner critic feels like a bad guy, so it's natural to try to kill it, hate it, or judge it back.",
                    '',
                    'In **Level 2** we look at why that does not work, and what the critic is actually doing for you.',
                    '',
                    'Press the button below when you are ready for Level 2.',
                ],
                buttonLabel: 'Proceed to next level',
            },
        ],
    },

    2: {
        channelIntro: {
            lines: [
                '**Welcome to Level 2**',
                '',
                'Today we focus on the **upsides and downsides** of critical self-talk — what it costs, and why it sticks around.',
                '',
                'The same inner voice can be your best coach and your worst critic. The critic is often a useful voice in a destructive mode, not a separate enemy.',
                '',
                'When self-talk turns repetitive and negative, the body can keep responding as if the threat is still happening — even when the event is long over.',
                '',
                "When you've read the intro above, press the button below.",
            ],
            buttonLabel: "I've read the intro",
        },
        threadSteps: [
            {
                lines: [
                    '**Watch the video below**',
                    '',
                    'This builds on Level 1 and sets up the exercises for this level.',
                    '',
                    "When you've watched the video, press the button below.",
                ],
                videoUrl: LINKS.videoDay2,
                buttonLabel: "I've watched the video",
            },
            {
                lines: [
                    '**Exercise: The W\'s (the win)**',
                    '',
                    'Self-criticism is often a strategy for dealing with discomfort. Before changing it, it helps to understand what it is doing for you today.',
                    '',
                    'Use your list from Level 1 (or make a new one). Ask: **What do I believe would happen if the inner critic disappeared?** What about that scares you the most?',
                    '',
                    'Common answers: preventing mistakes, staying motivated, or avoiding rejection from others first.',
                    '',
                    'Press Continue when you have reflected on this.',
                ],
                buttonLabel: 'Continue',
            },
            {
                lines: [
                    '**Exercise: The L\'s (the cost)**',
                    '',
                    'The critical voice usually does not feel good — but many of us minimize that cost.',
                    '',
                    'Sit with what the inner critic actually costs you: energy, clarity, joy, momentum. Be kind to yourself here; this part can feel uncomfortable.',
                    '',
                    'Press Continue when you are ready.',
                ],
                buttonLabel: 'Continue',
            },
            {
                lines: [
                    '**A reframe**',
                    '',
                    "The Inner Critic's attacks are often distorted attempts to help. It thinks judging will protect you from failure, humiliation, rejection, or abandonment.",
                    '',
                    'You do not have to banish the critic. You can discover what it thinks it is doing — that is the hinge for Level 3.',
                    '',
                    'Press the button below when this lands.',
                ],
                buttonLabel: 'Wrap up Level 2',
            },
            {
                lines: [
                    '**Level 2 complete.**',
                    '',
                    'In **Level 3** we focus on how to relate to the voice differently — not silencing it, but talking to yourself more effectively.',
                    '',
                    'Press the button below when you are ready for Level 3.',
                ],
                buttonLabel: 'Proceed to next level',
            },
        ],
    },

    3: {
        channelIntro: {
            lines: [
                '**Welcome to Level 3**',
                '',
                'Today is about **how you relate** to the inner voice — not fighting it, not obeying it, but changing the relationship.',
                '',
                'The goal is not to stop talking to yourself. The challenge is to talk to yourself more effectively.',
                '',
                'You deserve to feel good about yourself without having to earn it.',
                '',
                "When you've read the intro above, press the button below.",
            ],
            buttonLabel: "I've read the intro",
        },
        threadSteps: [
            {
                lines: [
                    '**Watch the video below**',
                    '',
                    'This closes the loop from Level 1 and Level 2.',
                    '',
                    "When you've watched the video, press the button below.",
                ],
                videoUrl: LINKS.videoDay3,
                buttonLabel: "I've watched the video",
            },
            {
                lines: [
                    '**Practice: distance, not suppression**',
                    '',
                    'Distancing is not avoidance. The point is to engage the problem from a zoomed-out perspective — seeing the attack as a part\'s message, not the truth about you.',
                    '',
                    'Try this when the voice shows up: *"There it is, doing that thing again."* Just naming it can reduce its grip.',
                    '',
                    'Press Continue when you have tried this at least once.',
                ],
                buttonLabel: 'Continue',
            },
            {
                lines: [
                    '**Practice: the voice is not you**',
                    '',
                    'Record yourself saying what the critic says — in its tone and emotion. Write down where you learned each line, especially the harshest ones.',
                    '',
                    'The voice was learned. That means it can change.',
                    '',
                    'Press Continue when you are ready to finish the course.',
                ],
                buttonLabel: 'Continue',
            },
            {
                lines: [
                    '**You made it.**',
                    '',
                    'Three levels of looking at the voice in your head — what it is, what it costs, and how to work with it differently.',
                    '',
                    'Press the button below to complete the course and unlock the graduate channels.',
                ],
                buttonLabel: 'Finish the course',
            },
        ],
    },
};

function getChannelIntroMarker(dayNumber) {
    const firstLine = days[dayNumber].channelIntro.lines[0] || '';
    return firstLine.replace(/\*\*/g, '').trim();
}

function getLegacyChannelIntroMarkers(dayNumber) {
    return [`Welcome to Day ${dayNumber}`];
}

const START_HERE_MARKER = 'Free 3-level course';

function stepCustomId(day, step) {
    return `course-d${day}-s${step}`;
}

function parseStepCustomId(customId) {
    const match = customId.match(/^course-d([123])-s([1-6])$/);
    if (!match) return null;
    return { day: Number(match[1]), step: Number(match[2]) };
}

function parseTitleLines(lines) {
    const copy = [...lines];
    if (copy[0]?.startsWith('**') && copy[0].includes('**')) {
        const title = copy[0].replace(/\*\*/g, '').trim();
        copy.shift();
        while (copy[0] === '') copy.shift();
        return { title, body: copy };
    }
    return { title: 'Next step', body: copy };
}

function buildReadableContent(lines, { stepNumber } = {}) {
    const { title, body } = parseTitleLines(lines);
    const displayTitle = stepNumber != null
        ? `:arrow_right: Step ${stepNumber}: ${title}`
        : title;

    return [
        STEP_SEPARATOR,
        '',
        `## ${displayTitle}`,
        '',
        ...body,
    ].join('\n');
}

function stepButtonRow(day, step, label) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(stepCustomId(day, step))
            .setLabel(label)
            .setStyle(ButtonStyle.Primary)
    );
}

function resolveChannelIntroLines(dayNumber) {
    const lines = [...days[dayNumber].channelIntro.lines];
    const needsLinks = lines.some(
        (line) => line.includes('{{LEVEL_CHANNEL}}') || line.includes('{{DISCUSSION_CHANNEL}}')
    );

    if (!needsLinks) return lines;

    const { config } = require('./config');
    const levelChannel = `<#${config.channels.intro[dayNumber]}>`;
    const discussionId = config.channels.courseDiscussion;
    const discussionChannel = discussionId ? `<#${discussionId}>` : '#discussion';

    return lines.map((line) =>
        line
            .replaceAll('{{LEVEL_CHANNEL}}', levelChannel)
            .replaceAll('{{DISCUSSION_CHANNEL}}', discussionChannel)
    );
}

function buildChannelIntroPayload(dayNumber) {
    const day = days[dayNumber];
    return {
        content: buildReadableContent(resolveChannelIntroLines(dayNumber)),
        components: [stepButtonRow(dayNumber, 1, day.channelIntro.buttonLabel)],
    };
}

function buildThreadStepPayload(dayNumber, threadStepIndex) {
    const day = days[dayNumber];
    const step = day.threadSteps[threadStepIndex];
    const nextButtonStep = threadStepIndex + 2;

    let content = buildReadableContent(step.lines, {
        stepNumber: threadStepIndex + 1,
    });

    if (step.videoUrl) {
        content = `${content}\n\n${step.videoUrl}`;
    }

    return {
        content,
        components: [stepButtonRow(dayNumber, nextButtonStep, step.buttonLabel)],
    };
}

function getThreadStepCount(dayNumber) {
    return days[dayNumber].threadSteps.length;
}

function getFinalStepNumber(dayNumber) {
    return getThreadStepCount(dayNumber) + 1;
}

module.exports = {
    days,
    LINKS,
    STEP_SEPARATOR,
    START_HERE_MARKER,
    getChannelIntroMarker,
    getLegacyChannelIntroMarkers,
    stepCustomId,
    parseStepCustomId,
    buildChannelIntroPayload,
    buildThreadStepPayload,
    getThreadStepCount,
    getFinalStepNumber,
};
