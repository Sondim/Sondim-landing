# Course bot — setup for Magnus

This bot is **Magnus Chirgwin** in Discord (your name + avatar, with a small APP/BOT badge). It guides students through the free **3-day course** using buttons and **private threads**.

Students never see a public “Ben started Day 1” message.

Paid checkout is **not** in this version.

---

## How the course flows

1. **`#start-here`** — student presses **Start Day 1** → gets `@Day1` + a private popup with a link to `#day-1`.
2. **`#day-1`** — one shared bot message with the **full Day 1 intro** + **I've read the intro**.
3. Pressing that button opens a **private thread** (e.g. `Day 1 — Anna`) under `#day-1`. Only that student sees it.
4. Each next button posts the **next step** in the same thread (videos, test link, workshop, etc.). History stays in the thread.
5. Last button of Day 1 unlocks **Day 2**. Same pattern in `#day-2` and `#day-3`.
6. Last button of Day 3 grants **Alumni** + welcome in `#grad-chat`.

**Edit all course copy** in [`content.js`](content.js) — intros, video URLs, workshop links, button labels.

---

## Before anything else

1. **Stop BotGhost** for this bot. Two systems cannot share the same token.
2. Keep the bot **in the server**. Same name, same picture.
3. Create a role named **Alumni** if you do not have one yet.

---

## 1. Discord Developer Portal

Open [discord.com/developers/applications](https://discord.com/developers/applications) → **Magnus Chirgwin** app.

### Bot tab

1. **Server Members Intent** → on. Save.
2. Copy token into password manager only. **Never paste into chat or GitHub.**

### Bot permissions (invite or bot role)

- View Channels
- Send Messages
- Embed Links (YouTube previews)
- Manage Roles
- Create Private Threads
- Send Messages in Threads
- Manage Threads
- Read Message History

---

## 2. Role order

Drag the **bot role** **above** Day 1, Day 2, Day 3, and Alumni.

---

## 3. Channel permissions

For each **Day 1 / Day 2 / Day 3** category:

| Who | View channel |
|---|---|
| @everyone | **Off** |
| Day 1 role | **On** for Day 1 only |
| Day 2 role | **On** for Day 2 (keep Day 1 on for graduates) |
| Day 3 role | **On** for Day 3 |
| Bot | **On** for all three |

On **`#day-1`, `#day-2`, `#day-3`** (if unsynced from category), grant the APP:

- View Channel
- Send Messages
- Read Message History
- Create Private Threads
- Send Messages in Threads
- Manage Threads

**Grad category:** `@everyone` off, **Alumni** on.

Always visible: `#start-here`, `#general`, Q&A.

Optional: `#resources-day-*` channels can be **archived** — the bot no longer uses them.

Set **thread auto-archive** to **1 week** (or longer) in Server Settings so inactive student threads stay easy to reopen.

---

## 4. Environment variables

Copy `.env.example` → `.env`. Required:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
ROLE_DAY1=
ROLE_DAY2=
ROLE_DAY3=
ROLE_ALUMNI=
CHANNEL_START_HERE=
CHANNEL_DAY1=
CHANNEL_DAY2=
CHANNEL_DAY3=
CHANNEL_GRAD_CHAT=
```

Optional: `VIDEO_DAY1_2`, `VIDEO_DAY2`, `VIDEO_DAY3`, `CHANNEL_LOG`, grad/promo IDs.

`CHANNEL_RESOURCES_DAY*` is optional and unused.

---

## 5. Host on Discloud

1. Zip these files from `discord-bot/`:
   - `index.js`, `config.js`, `progress.js`, `content.js`, `threads.js`, `package.json`, `discloud.config`, `.env`
2. Upload at [discloud.com](https://discloud.com).
3. Logs should say `Logged in as Magnus Chirgwin`.

After code changes, re-zip and upload over the existing app.

---

## 6. Run `/setup` in Discord

Staff only. This posts (or updates):

- Start button in `#start-here`
- Full intro + first button in each `#day-1`, `#day-2`, `#day-3`

Remove old **pinned intro** messages if they duplicate the bot intro.

---

## 6b. Retest with `/reset-progress`

Staff only. Wipes one student back to zero:

```
/reset-progress
/reset-progress student:@TestAccount
```

This removes **Day 1 / Day 2 / Day 3 / Alumni** roles, clears bot progress, and deletes their private course threads. Then they can press **Start Day 1** again.

Bot needs **Manage Threads** to delete private threads.

---

## 7. Test with a second account

Not admin. No Day 1 role yet.

1. **Start Day 1** → private popup → open `#day-1`.
2. Read intro → **I've read the intro** → private thread appears with video step.
3. Work through buttons in the thread through to **Proceed to next level**.
4. `#day-2` unlocks. Repeat.
5. Finish Day 3 → Alumni + `#grad-chat`.

If a student loses the popup, they reopen their thread from the `#day-N` sidebar.

---

## What you can change without a coder

- Channel names, role colors, server layout
- Archive old resource channels

## What to edit in `content.js`

- Day intros and thread step text
- YouTube and workshop URLs
- Button labels
- Optional: set `VIDEO_DAY1_2` in `.env` for the Day 1 second video

---

## Paid later

Add a `@Paid` role in front of Start. The unlock path stays the same.
