# Course bot — setup for Magnus (no coding)

This bot is **Magnus Chirgwin** in Discord (your name + avatar, with a small APP/BOT badge). It unlocks Day 1 → 2 → 3 when someone presses a button, and pings **only that person** in a private thread.

Students never see a public “Ben started Day 1” message.

Paid checkout is **not** in this version. When people finish the free course and ask for more, we add a lock in front of Start.

---

## Before anything else

1. **Stop BotGhost** for this bot. Two systems cannot share the same token.
2. Keep the bot **in the server**. Same name, same picture.
3. Create a role named **Alumni** (or **Finished**) if you do not have one yet.

---

## 1. Discord Developer Portal (10 min)

Open [discord.com/developers/applications](https://discord.com/developers/applications) and click the **Magnus Chirgwin** app.

### Bot tab

1. **Privileged Gateway Intents** → turn on **Server Members Intent**. Save.
2. **Reset Token** only if BotGhost still has the old one and you want a clean break. Copy the token into a password manager. **Never paste it into Cursor chat, email, or GitHub.**

### OAuth2 → URL Generator (only if the bot is not in the server)

Scopes: `bot`, `applications.commands`

Bot permissions:

- View Channels
- Send Messages
- Embed Links
- Add Reactions
- Manage Roles
- Create Public Threads
- Create Private Threads
- Send Messages in Threads
- Manage Threads
- Read Message History

Open the generated URL, pick the course server, authorize.

---

## 2. Role order (2 min)

Server Settings → Roles. Drag **the bot’s role** (Magnus Chirgwin) **above**:

- Day 1
- Day 2
- Day 3
- Alumni

If it sits below them, buttons will fail with a permissions error.

Give **yourself** a Staff / admin view of every Day category so you are never locked out while testing.

---

## 3. Channel permissions (20–40 min)

For each **Day 1 / Day 2 / Day 3** category:

| Who | View channel |
|---|---|
| @everyone | **Off** |
| Day 1 role | **On** for Day 1 category only |
| Day 2 role | **On** for Day 2 (keep Day 1 on for people who already have Day 1) |
| Day 3 role | **On** for Day 3 |
| Bot | **On** for all three |
| You / Staff | **On** for all three |

Always visible to everyone (or Joiner):

- `#start-here`
- `#general`
- Q&A voice

Optional: create `#bot-log` that only you and the bot can see.

---

## 4. Copy IDs (10 min)

Discord Settings → Advanced → **Developer Mode** on.

Then right-click each thing → **Copy Server ID** / **Copy Role ID** / **Copy Channel ID**.

Paste them into a notes file on your computer (not into chat):

```
DISCORD_CLIENT_ID=     (Application ID on the General Information tab of the Developer Portal)
DISCORD_GUILD_ID=      (right-click the server icon)
ROLE_DAY1=
ROLE_DAY2=
ROLE_DAY3=
ROLE_ALUMNI=
CHANNEL_START_HERE=
CHANNEL_DAY1=          (the intro text channel, not resources)
CHANNEL_DAY2=
CHANNEL_DAY3=
CHANNEL_RESOURCES_DAY1=
CHANNEL_RESOURCES_DAY2=
CHANNEL_RESOURCES_DAY3=
CHANNEL_LOG=           (optional)
```

`DISCORD_TOKEN` is the bot token from step 1. Put it only in the `.env` file you upload to Discloud — never GitHub or chat.

---

## 5. Host on Discloud (free, made for Discord bots)

GitHub Pages cannot run a bot. Railway is paid after a trial. **[Discloud](https://discloud.com) free plan** is one small always-on bot (100 MB). That is enough for this.

Koyeb’s free tier sleeps after an hour — buttons would stop working. Do not use it for this.

### 5a. Create a `.env` file

In the `discord-bot` folder, copy `.env.example` and name the copy `.env`. Fill it in. Yours looks like this (add the token yourself):

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=1529464296797634731
DISCORD_GUILD_ID=1356608874786066502
ROLE_DAY1=1526283207308214273
ROLE_DAY2=1526283382781378580
ROLE_DAY3=1526283527077888041
ROLE_ALUMNI=1526283565489459365
CHANNEL_START_HERE=1538872437939249193
CHANNEL_DAY1=1526284554359406642
CHANNEL_DAY2=1526284609145540708
CHANNEL_DAY3=1529468705300283503
CHANNEL_RESOURCES_DAY1=1526212818335174777
CHANNEL_RESOURCES_DAY2=1526284197084270682
CHANNEL_RESOURCES_DAY3=1538868434706628678
CHANNEL_LOG=1538818523973951558
```

`.env` is gitignored. Do not commit it.

### 5b. Zip and upload

1. Sign up at [discloud.com](https://discloud.com) (they may ask you to join their Discord once to verify).
2. In File Explorer open `discord-bot`.
3. Select: `index.js`, `config.js`, `progress.js`, `package.json`, `discloud.config`, `.env`
4. Right-click → **Send to → Compressed (zipped) folder**. Do **not** include `node_modules`.
5. Dashboard → **Applications** → **+ Upload** → **Upload ZIP** → drop the zip.
6. Wait until it shows online. Logs should say `Logged in as Magnus Chirgwin`.

If it crashes, the log usually means a missing `.env` line or the token is wrong. Paste the log here (never the token).

---

## 6. In Discord

1. Type `/setup` (only people who can manage the server).
2. Confirm buttons appear in `#start-here` and each `#resources-day-*`.
3. Pin **your** intro and resource text in those channels (the messages from your screenshots). The bot only owns the button messages.

Running `/setup` again updates the same button messages. It does not spam new ones.

---

## 7. Test with a second Discord account

Use an account that is **not** admin (admin can see hidden channels and the test lies).

1. Join → you should **not** see Day 2 / Day 3.
2. Press **Start Day 1** → Day 1 appears, you get a mention in a private thread.
3. Your main account should **not** get a ping.
4. Press **I'm done with Day 1** → Day 2 appears + a new mention.
5. Repeat through Day 3.
6. Come back later: Days 1–3 still visible (own it forever).

If something fails, the button reply will include a hint. Paste that text here (never the token).

---

## What you can change without code

- Intro / resource **copy** in Discord (pins)
- Channel names and topic text
- Role colors

Need a coder for:

- Button labels
- Adding Day 4
- Paid lock in front of Start

---

## Paid later (do not build now)

Same bot. Add a `@Paid` role and only show Start (or auto-grant Day 1) after checkout. The unlock path you are testing now stays the same.
