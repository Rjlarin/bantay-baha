# Bantay Baha Flood Monitor

A mobile-friendly flood monitoring demo for a simulated creek sensor. It provides a REST API, gradual sensor simulator, current status, recent trend chart, summary analytics, and an English/Filipino advisory. Readings are stored in memory, so restarting the server clears them.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`. In a second terminal, run:

```bash
npm run simulate
```

To use the simulator against another API, set `API_URL`, for example:

```bash
API_URL=https://YOUR-DEPLOYED-URL.onrender.com/api/readings npm run simulate
```

## API

- `POST /api/readings` accepts `{ "sensorId": "CREEK-01", "waterLevelCm": 84.5, "timestamp": "2026-10-17T14:05:00+08:00" }` and returns `201`. A timestamp is optional and defaults to the current time. Invalid sensor IDs or levels outside 0–500 return `400` with an error.
- `GET /api/readings` returns up to 50 most recent readings, newest first.
- `GET /api/summary` returns average, minimum, maximum, status counts, and trend.
- `POST /api/advisory` returns a bilingual advisory from Gemini when configured, or a local rule-based fallback.
- `GET /health` reports whether the server is responding.

The status thresholds are Normal below 100 cm, Alert from 100 through 149.9 cm, and Danger at 150 cm or above. The trend compares the average of the latest five chronological readings against the five before them; a difference above 1 cm is rising, below -1 cm is falling, and otherwise steady. Fewer than 10 readings produce a steady trend until there are two complete groups.

## Gemini advisory prompt

The server sends this prompt together with the computed JSON summary:

> Write a public flood advisory in English and Filipino, no more than 3 sentences total. Use only these supplied numbers; do not invent facts, locations, causes, forecasts, or evacuation orders. Recommend cautious actions based on the status counts and trend, and say to follow official barangay instructions. Data: `{summary JSON}`

Set `GEMINI_API_KEY` in your local `.env` file or in your hosting provider's environment settings. The default model is `gemini-3.8-flash`; you can change it with `GEMINI_MODEL`. Never paste a real key into source code, README, GitHub, or a commit. If the key is missing or the API call fails, the server returns a rule-based advisory.

## Deployment notes

This Express app can be deployed to Render as a Web Service using build command `npm install` and start command `npm start`. Set `GEMINI_API_KEY` in the Render Environment settings if you have one. After deploy, open the live URL and run the simulator with the deployed `/api/readings` URL. Free hosting may sleep when idle, so the first request can take longer.

Deployment status: Not deployed from this workspace. Before submission, add the public repository URL, live URL, and any deployment error and attempted fix here.

## Demo and submission checklist

- [ ] Push all project files to the public `bantay-baha` GitHub repository.
- [ ] Confirm the public page loads and the simulator updates it every five seconds.
- [ ] Test valid and invalid POST requests and confirm the summary and advisory work.
- [ ] Add the live URL above and record a video of 2 minutes or less showing simulator, updates, and advisory generation.
- [ ] Ensure no real API key appears anywhere in the repository or its commit history.
