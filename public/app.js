let chart;
const els = Object.fromEntries(['current-level','updated-at','status-badge','status-text','average','minimum','maximum','trend','trend-note','count-normal','count-alert','count-danger','reading-total','reading-rows','connection-message','advisory-text','advisory-source','generate-advisory'].map((id) => [id, document.getElementById(id)]));

function statusFor(level) {
  if (level >= 150) return 'Danger';
  if (level >= 100) return 'Alert';
  return 'Normal';
}
function fmtTime(value) {
  return new Intl.DateTimeFormat('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}
function showSummary(summary) {
  els.average.textContent = summary.averageCm ?? '--';
  els.minimum.textContent = summary.minimumCm ?? '--';
  els.maximum.textContent = summary.maximumCm ?? '--';
  els.trend.textContent = summary.trend;
  els.trendNote.textContent = summary.readingCount < 10 ? 'More readings improve the comparison' : 'Compared last 5 with previous 5';
  els['count-normal'].textContent = summary.statusCounts.Normal;
  els['count-alert'].textContent = summary.statusCounts.Alert;
  els['count-danger'].textContent = summary.statusCounts.Danger;
}
function showReadings(readings) {
  els.readingTotal.textContent = `${readings.length} recent reading${readings.length === 1 ? '' : 's'}`;
  if (!readings.length) {
    els.readingRows.innerHTML = '<tr><td colspan="4" class="empty">No readings yet. Start the simulator.</td></tr>';
    els['current-level'].textContent = '--';
    els['status-text'].textContent = 'NO DATA';
    els.statusBadge.className = 'status no-data';
    els['updated-at'].textContent = 'Waiting for first reading…';
    drawChart([]);
    return;
  }
  const newest = readings[0];
  const level = newest.waterLevelCm;
  const status = statusFor(level);
  els['current-level'].textContent = level.toFixed(1);
  els['status-text'].textContent = status.toUpperCase();
  els.statusBadge.className = `status ${status.toLowerCase()}`;
  els['updated-at'].textContent = `Updated ${fmtTime(newest.timestamp)} · ${newest.sensorId}`;
  els.readingRows.innerHTML = readings.slice(0, 10).map((reading) => {
    const kind = statusFor(reading.waterLevelCm);
    return `<tr><td>${fmtTime(reading.timestamp)}</td><td>${escapeHtml(reading.sensorId)}</td><td>${reading.waterLevelCm.toFixed(1)} cm</td><td><span class="reading-status ${kind.toLowerCase()}">${kind}</span></td></tr>`;
  }).join('');
  drawChart(readings);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function drawChart(readings) {
  if (typeof Chart === 'undefined') return;
  const ordered = [...readings].reverse();
  const data = {
    labels: ordered.map((reading) => fmtTime(reading.timestamp)),
    datasets: [{ label: 'Water level (cm)', data: ordered.map((reading) => reading.waterLevelCm), borderColor: '#087f8c', backgroundColor: 'rgba(8,127,140,.10)', fill: true, tension: .35, pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 }]
  };
  if (!chart) {
    chart = new Chart(document.getElementById('level-chart'), { type: 'line', data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6, maxRotation: 0, font: { size: 9 } } }, y: { beginAtZero: true, grid: { color: '#edf2f1' }, ticks: { font: { size: 9 } } } } } });
  } else { chart.data = data; chart.update('none'); }
}
async function refresh() {
  try {
    const [readingsResponse, summaryResponse] = await Promise.all([fetch('/api/readings'), fetch('/api/summary')]);
    if (!readingsResponse.ok || !summaryResponse.ok) throw new Error('The server returned an error.');
    const [readings, summary] = await Promise.all([readingsResponse.json(), summaryResponse.json()]);
    showReadings(readings);
    showSummary(summary);
    els.connectionMessage.textContent = '';
  } catch (error) {
    els.connectionMessage.textContent = 'Cannot connect to the monitor. Check that the app server is running.';
  }
}
els.generateAdvisory.addEventListener('click', async () => {
  els.generateAdvisory.disabled = true;
  els.generateAdvisory.textContent = 'Generating…';
  try {
    const response = await fetch('/api/advisory', { method: 'POST' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Advisory unavailable.');
    els.advisoryText.textContent = result.advisory;
    els.advisorySource.textContent = result.source === 'gemini' ? 'Generated from the latest readings' : 'Rule-based fallback using the latest readings';
  } catch (_error) {
    els.advisoryText.textContent = 'Please check the latest readings and follow official barangay instructions. / Pakitingnan ang pinakabagong datos at sundin ang opisyal na tagubilin ng barangay.';
    els.advisorySource.textContent = 'Local fallback';
  } finally {
    els.generateAdvisory.disabled = false;
    els.generateAdvisory.textContent = 'Generate advisory';
  }
});
refresh();
setInterval(refresh, 5000);
