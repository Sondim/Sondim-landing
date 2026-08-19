# Course bot — setup for Magnus (no coding)

This bot is **Magnus Chirgwin** in Discord (your name + avatar, with a small APP/BOT badge). It unlocks Day 1 → 2 → 3 when someone presses a button, and pings **only that person** in a private thread under **`#your-briefing`** at the top of that day’s category (so the ping sits above `#day-1` / `#day-2` / `#day-3`).

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
- Manage Channels (needed so `/setup` can create `#your-briefing` at the top of each Day category)
- Create Public Threads
- Create Private Threads
- Send Messages in Threads
- Manage Threads
- Read Message History

If the bot is **already in the server**, add **Manage Channels** on the bot role in Server Settings → Roles (or re-run the invite URL with that permission).

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

**Grad category** (`grad-chat` + graduate voice): `@everyone` **Off**. **Alumni** **On**. Bot **On**. That is how finishing Day 3 unlocks the reward room.

**Also grant the APP on `#day-1` itself**, not only the Day 1 category. If that channel is unsynced, category allows do not apply. Open `#day-1` → Edit Channel → Permissions → add **Magnus Chirgwin** (the APP) → turn **ON**:

- View Channel
- Send Messages
- Read Message History
- Create Private Threads
- Send Messages in Threads
- Manage Threads

Do the same on `#day-2` and `#day-3` if they are unsynced. Then confirm **CHANNEL_DAY1** in `.env` is the ID from right-click `#day-1` → Copy Channel ID (not resources, not an old deleted channel). `/setup` will echo the intro channel **name + ID** so you can check this.

Always visible to everyone (or Joiner):

- `#start-here`
- `#general`
- Q&A voice

Optional: create `#bot-log` that only you and the bot can see.

`/setup` creates **`#your-briefing`** as the first channel in each Day category. Students with that day’s role can see it; they talk in their private thread, not in the parent channel.

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
CHANNEL_DAY1=          (right-click the live #day-1 intro channel — not resources)
CHANNEL_DAY2=
CHANNEL_DAY3=
CHANNEL_RESOURCES_DAY1=
CHANNEL_RESOURCES_DAY2=
CHANNEL_RESOURCES_DAY3=
CHANNEL_LOG=           (optional)
CATEGORY_GRAD=         (grad category)
CHANNEL_GRAD_CHAT=     (#grad-chat)
CHANNEL_GRAD_VOICE=    (optional)
CHANNEL_SELF_PROMOTION= (optional)
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
CHANNEL_DAY2=1539183494855397396
CHANNEL_DAY3=1539183541072437248
CHANNEL_RESOURCES_DAY1=1526212818335174777
CHANNEL_RESOURCES_DAY2=1526284197084270682
CHANNEL_RESOURCES_DAY3=1538868434706628678
CHANNEL_LOG=1538818523973951558
CATEGORY_GRAD=1539237731144568862
CHANNEL_GRAD_CHAT=1539234069789810748
CHANNEL_GRAD_VOICE=1539238258167390350
CHANNEL_SELF_PROMOTION=1539169770136412220
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

### 5c. After a code update (this fix)

The bot already on Discloud does **not** pick up GitHub commits. Zip the same six files again and upload over the existing app.

1. Grant the APP **Manage Channels**, plus the `#day-1` channel permissions in section 3.
2. Upload the new zip. Wait until logs say `Logged in as Magnus Chirgwin`.
3. In Discord run `/setup`. You should see `#your-briefing` at the top of each Day category, and each intro name listed.
4. Test **Start Day 1** with an account that does not already have Day 1.

---

## 6. In Discord

1. Type `/setup` (only people who can manage the server).
2. Confirm buttons appear in `#start-here` and each `#resources-day-*`.
3. Confirm `#your-briefing` is the **first** channel in Day 1, Day 2, and Day 3. `/setup` also lists each intro channel name — it must match `#day-1` / `#day-2` / `#day-3`.
4. Pin **your** intro and resource text in those channels (the messages from your screenshots). The bot only owns the button messages.

Running `/setup` again updates the same button messages and repositions `#your-briefing`. It does not spam extra buttons.

If `/setup` errors about Missing Permissions, the bot still needs **Manage Channels**. Add it, then run `/setup` again.

---

## 7. Test with a second Discord account

Use an account that is **not** admin (admin can see hidden channels and the test lies) and does **not** already have the Day 1 role (Start is skipped if they already have it).

1. Join → you should **not** see Day 2 / Day 3.
2. Press **Start Day 1** → Day 1 appears. You get a mention in a private thread under **`#your-briefing`**, above `#day-1`.
3. Your main account should **not** get a ping.
4. Press **I'm done with Day 1** → Day 2 appears + a new mention under that day’s `#your-briefing`.
5. Repeat through Day 3.
6. Come back later: Days 1–3 still visible (own it forever).

Old private threads that already sit under `#day-3` cannot be moved. Only new unlocks go under `#your-briefing`.

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
