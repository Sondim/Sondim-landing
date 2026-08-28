# Deploy checklist (after code update)

1. Zip and upload to Discloud:
   - `index.js`, `config.js`, `progress.js`, `content.js`, `threads.js`, `package.json`, `discloud.config`, `.env`
2. Confirm Discloud logs: `Logged in as Magnus Chirgwin`
3. In Discord, run `/setup` (staff account)
4. Remove old pinned intros in `#day-1`, `#day-2`, `#day-3` if they duplicate the bot message
5. Archive `#resources-day-1`, `#resources-day-2`, `#resources-day-3` (optional)
6. Test with a second account: Start Day 1 → intro → private thread → full Day 1 chain → Day 2 unlock
7. Set Day 1 second video URL in `.env` as `VIDEO_DAY1_2=` or edit `LINKS.videoDay1Part2` in `content.js`

## If Discloud says `TokenInvalid`

This is **not** a course-flow bug. Discord rejected the bot token.

1. [Discord Developer Portal](https://discord.com/developers/applications) → **Magnus Chirgwin** → **Bot** → **Reset Token**
2. Copy the new token into `discord-bot/.env` as `DISCORD_TOKEN=` (no quotes, no spaces)
3. Stop BotGhost or anywhere else that might still use the old token
4. Re-zip and upload again

## If Discloud says `Missing CHANNEL_…`

Your uploaded `.env` is incomplete. Compare with `.env.example` and `the way the discord bot is set up.txt`.
