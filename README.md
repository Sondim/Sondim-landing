# Sondim — Game Dev Coaching Site

Live at [https://sondim.github.io/](https://sondim.github.io/)

## What's here

- **12 animation principles** as interactive coaching metaphors
- **Free assessment**, vision board, team rhythm mapper
- **Survival guide** PDF and Google Calendar booking
- **Draw board** — Gartic-style sketch pad; visitors send drawings to you

## Receive drawings by email (one-time setup)

1. Sign up at [web3forms.com](https://web3forms.com) (free)
2. Copy your **Access Key**
3. Paste into `js/site-config.js` → `web3formsAccessKey: "your-key-here"`

Without a key, submit still works: the PNG downloads and their email app opens to attach it.

## Local preview

```bash
npx --yes serve .
```

## Discord course bot

The free 3-day course lives in Discord. Setup (no coding): [discord-bot/README.md](discord-bot/README.md)

## Edit content

- `index.html` — page copy
- `css/site.css` — styles and motion
- `js/assessment.js` — assessment questions (`ASSESSMENT_STEPS`)
