# Discord 3-Day Course Bot

Progressive-disclosure onboarding bot for a 3-day course (discord.js v14).

## How it works

1. An **admin** posts each day’s embed once with `/testday1`, `/testday2`, or `/testday3`.
2. Members click **Complete Day N**.
3. Days 1–2: ephemeral confirmation, then after **1 minute** the next day role is granted (channel unlock). Day 3 grants the completion role immediately.
4. Repeat completes are ignored. Pending unlock timers live **in memory only** — a bot restart cancels them.

Edit lesson copy in [`content.js`](content.js) (`EDIT DAY N TEXT HERE`). IDs and delay live in [`config.js`](config.js).

## Discord setup checklist

1. Create a bot application (identity: your custom app, e.g. “Magnus Chirgwin”).
2. Invite the bot with permissions: **Send Messages**, **Embed Links**, **Manage Roles**, **Use Application Commands**.
3. In the Developer Portal → Bot → Privileged Gateway Intents, enable:
   - **Server Members Intent**
   - **Message Content Intent** (included for completeness; slash flow does not require it)
4. Place the bot’s role **above** Day 2, Day 3, and completion roles in Server Settings → Roles.
5. Gate Day 2 / Day 3 channels so only members with those roles can view them.

## Install and start

```powershell
cd "C:\Users\magnu\Documents\GitHub\Sondim.github.io\course stuff\discord course bot"
npm install
copy .env.example .env
```

Edit `.env`:

- `DISCORD_TOKEN` — bot token  
- `DISCORD_CLIENT_ID` — application client ID  
- `DISCORD_GUILD_ID` — your server ID (recommended while testing)

```powershell
npm run register
npm start
```

## Admin commands

| Command     | Effect                                      |
|------------|----------------------------------------------|
| `/testday1` | Post Day 1 embed + Complete Day 1 button     |
| `/testday2` | Post Day 2 embed + Complete Day 2 button     |
| `/testday3` | Post Day 3 embed + Complete Day 3 button     |

Administrator permission required.

## Production delay

In `config.js`, set `UNLOCK_DELAY_MS` to `24 * 60 * 60 * 1000` for a 24-hour unlock. Update the confirmation strings in `content.js` to match.
