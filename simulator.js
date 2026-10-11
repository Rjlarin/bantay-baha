const API_URL = process.env.API_URL || 'http://localhost:3000/api/readings';
let waterLevelCm = 82;

async function sendReading() {
  // A real setup would replace this simulation with a microcontroller and ultrasonic sensor sending readings over Wi-Fi or MQTT.
  waterLevelCm = Math.max(10, Math.min(220, waterLevelCm + Math.round(Math.random() * 8 - 4)));
  const reading = {
    sensorId: 'CREEK-01',
    waterLevelCm,
    timestamp: new Date().toISOString()
  };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reading)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    console.log(`Sent ${result.waterLevelCm} cm at ${result.timestamp}`);
  } catch (error) {
    console.error(`Could not send reading to ${API_URL}: ${error.message}`);
  }
}

console.log(`Sending simulated readings to ${API_URL} every 5 seconds. Press Ctrl+C to stop.`);
sendReading();
setInterval(sendReading, 5000);
