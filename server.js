const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const readings = [];

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function statusFor(level) {
  if (level >= 150) return 'Danger';
  if (level >= 100) return 'Alert';
  return 'Normal';
}

function makeSummary(items = readings) {
  const levels = items.map((reading) => reading.waterLevelCm);
  const avg = (values) => values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
  const chronological = [...items].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const recent = chronological.slice(-5);
  const previous = chronological.slice(-10, -5);
  let trend = 'steady';
  if (recent.length && previous.length) {
    const difference = avg(recent.map((r) => r.waterLevelCm)) - avg(previous.map((r) => r.waterLevelCm));
    if (difference > 1) trend = 'rising';
    else if (difference < -1) trend = 'falling';
  }
  const statusCounts = { Normal: 0, Alert: 0, Danger: 0 };
  for (const reading of items) statusCounts[statusFor(reading.waterLevelCm)] += 1;
  return {
    averageCm: levels.length ? Number(avg(levels).toFixed(1)) : null,
    minimumCm: levels.length ? Math.min(...levels) : null,
    maximumCm: levels.length ? Math.max(...levels) : null,
    statusCounts,
    trend,
    readingCount: items.length
  };
}

function fallbackAdvisory(summary) {
  if (summary.readingCount === 0) {
    return 'No readings are available yet. Please check again shortly. / Wala pang datos; pakitingnan muli mamaya.';
  }
  const average = summary.averageCm;
  let english;
  let filipino;
  if (summary.statusCounts.Danger > 0 || summary.maximumCm >= 150) {
    english = 'Danger level detected: move away from the creek and follow barangay evacuation instructions.';
    filipino = 'May antas ng panganib: lumayo sa sapa at sundin ang mga tagubilin ng barangay para sa paglikas.';
  } else if (summary.statusCounts.Alert > 0 || average >= 100) {
    english = 'Water is elevated: stay alert, avoid crossing floodwater, and prepare essentials.';
    filipino = 'Mataas ang tubig: magmatyag, huwag tumawid sa baha, at ihanda ang mahahalagang gamit.';
  } else {
    english = 'Water is currently below alert level: keep monitoring and follow official updates.';
    filipino = 'Nasa ibaba ng antas ng babala ang tubig: patuloy na magmasid at sumunod sa opisyal na anunsyo.';
  }
  return `${english} ${filipino}`;
}

app.post('/api/readings', (req, res) => {
  const { sensorId, waterLevelCm, timestamp } = req.body || {};
  if (typeof sensorId !== 'string' || !sensorId.trim()) {
    return res.status(400).json({ error: 'sensorId is required and must be a non-empty string.' });
  }
  if (waterLevelCm === undefined || typeof waterLevelCm !== 'number' || !Number.isFinite(waterLevelCm)) {
    return res.status(400).json({ error: 'waterLevelCm is required and must be a number.' });
  }
  if (waterLevelCm < 0 || waterLevelCm > 500) {
    return res.status(400).json({ error: 'waterLevelCm must be between 0 and 500 cm.' });
  }
  const parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(parsedTimestamp.getTime())) {
    return res.status(400).json({ error: 'timestamp must be a valid date-time.' });
  }
  const reading = {
    sensorId: sensorId.trim(),
    waterLevelCm: Number(waterLevelCm.toFixed(1)),
    timestamp: parsedTimestamp.toISOString()
  };
  readings.push(reading);
  return res.status(201).json(reading);
});

app.get('/api/readings', (_req, res) => {
  res.json([...readings].slice(-50).reverse());
});

app.get('/api/summary', (_req, res) => {
  res.json(makeSummary());
});

app.post('/api/advisory', async (_req, res) => {
  const summary = makeSummary();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.json({ advisory: fallbackAdvisory(summary), source: 'rule-based' });

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const prompt = `Write a public flood advisory in English and Filipino, no more than 3 sentences total. Use only these supplied numbers; do not invent facts, locations, causes, forecasts, or evacuation orders. Recommend cautious actions based on the status counts and trend, and say to follow official barangay instructions. Data: ${JSON.stringify(summary)}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const data = await response.json();
    const advisory = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim();
    if (!advisory) throw new Error('Gemini returned no advisory text');
    return res.json({ advisory, source: 'gemini' });
  } catch (error) {
    console.error('Advisory generation failed:', error.message);
    return res.json({ advisory: fallbackAdvisory(summary), source: 'rule-based' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Bantay Baha is running on port ${PORT}`));
