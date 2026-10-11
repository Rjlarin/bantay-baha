# Security, Ethics, and Emerging Technology Reflection

## 1. Security risks and fixes

Anyone can currently submit fake readings, which could distort the chart or create a false alert; I would require authenticated sensor credentials, validate the sensor ID against a registry, and rate-limit submissions. The API also has no role-based access control or audit trail, so a production version should restrict sensor and official actions, record changes, and use HTTPS. The Gemini key is read only from a server environment variable and is excluded from Git with `.gitignore`.

## 2. Responsibility and safeguards for wrong AI advisories

The barangay remains responsible for public safety decisions because this app is only a decision-support tool, and developers are responsible for clearly communicating its limitations. I would show the measured values beside every advisory, label AI text as a draft, require an authorized official to approve public alerts, and always direct residents to official instructions. The app also falls back to a simple rule-based message when the AI call fails.

## 3. AR/VR or blockchain

AR could let an official point a phone camera at a known creek location and view the current sensor reading and its threshold overlay during an inspection. It may not be worth the cost if officials can get the same information more reliably from a simple dashboard, and AR requires compatible devices, calibration, and maintenance.

## 4. Big data with 200 sensors

With 200 sensors, the app would need durable time-series storage, sensor and location metadata, data-quality checks, and scalable ingestion instead of one in-memory array. Analytics could compare neighborhoods, detect unusual rises, handle missing or faulty sensors, and calculate trends over time, while maps and alert routing would need careful privacy, reliability, and validation controls.
