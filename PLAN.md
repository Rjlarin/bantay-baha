# Bantay Baha Sprint Plan

## User stories and acceptance criteria

### 1. Resident: check the creek level
As a resident, I want to see the current creek water level and its status so that I can decide when to pay closer attention to official updates.

- The page shows the latest reading in centimeters and labels it Normal, Alert, or Danger using the 100 cm and 150 cm thresholds.
- The readings and summary update automatically every five seconds without a page reload.
- At a 375 px viewport, the page has no horizontal page scrolling and the status is readable.

### 2. Barangay official: review recent conditions
As a barangay official, I want to review recent readings and the trend so that I can monitor whether water levels are changing.

- `GET /api/readings` returns no more than 50 newest readings first.
- The page plots recent readings and displays a table of the 10 latest readings.
- The summary provides average, minimum, maximum, status counts, and a rising, falling, or steady trend.

### 3. Resident: receive a plain-language advisory
As a resident, I want a short advisory in English and Filipino based on the sensor summary so that I can understand practical next steps.

- The Generate advisory button returns an advisory in both languages with no more than three sentences.
- The server keeps the AI key in an environment variable and sends only the computed summary to the model.
- If AI generation is unavailable, the app returns a rule-based bilingual advisory.

## Sprint backlog

| Task | Status |
| --- | --- |
| Create Express app and static responsive page | Done |
| Add and validate `POST /api/readings` | Done |
| Add recent readings and analytics endpoints | Done |
| Create gradual five-second sensor simulator | Done |
| Display status, analytics, chart, and latest readings | Done |
| Add Gemini advisory and rule-based fallback | Done |
| Write README and security/ethics reflection | Done |
| Run local API and mobile-width checks | To Do |
| Deploy app and test simulator against public URL | To Do |
| Record a short demo and submit repository/live URL | To Do |

## SDLC model

This lab follows an Agile sprint model because the work is time-boxed, prioritized as a backlog, and delivered in small testable features that can be reviewed and improved during one sprint.
