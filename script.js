const CSV_PATH = 'umkm_success_prediction_with_success.csv';
let rawData = [];
let headers = [];

const el = {
  categoryFilter: document.getElementById('categoryFilter'),
  xField: document.getElementById('xField'),
  yField: document.getElementById('yField'),
  refreshBtn: document.getElementById('refreshBtn'),
  barExplain: document.getElementById('barExplain'),
  lineExplain: document.getElementById('lineExplain'),
  pieExplain: document.getElementById('pieExplain'),
  insightText: document.getElementById('insightText')
};

let charts = { bar: null, line: null, pie: null };

async function fetchAndParseCSV() {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_PATH, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: results => {
        rawData = results.data;
        headers = results.meta.fields || [];
        resolve();
      },
      error: err => reject(err)
    });
  });
}

function populateControls() {
  el.xField.innerHTML = '';
  el.yField.innerHTML = '';
  el.categoryFilter.innerHTML = '<option value="__all__">All</option>';
  headers.forEach(h => {
    el.xField.appendChild(new Option(h, h));
    el.yField.appendChild(new Option(h, h));
    el.categoryFilter.appendChild(new Option(h, h));
  });
}

function aggregateForBar(xField, yField) {
  const map = new Map();
  rawData.forEach(row => {
    const x = String(row[xField] ?? 'Unknown');
    const y = row[yField];
    if (!map.has(x)) map.set(x, { count: 0, sum: 0 });
    const obj = map.get(x);
    obj.count += 1;
    if (typeof y === 'number') obj.sum += y;
  });
  const labels = Array.from(map.keys());
  const counts = labels.map(l => map.get(l).count);
  return { labels, counts };
}

function buildBarChart(data) {
  const ctx = document.getElementById('barChart').getContext('2d');
  if (charts.bar) charts.bar.destroy();
  charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{ label: 'Jumlah', data: data.counts, backgroundColor: '#60a5fa' }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
  const max = Math.max(...data.counts);
  const maxLabel = data.labels[data.counts.indexOf(max)];
  el.barExplain.textContent = `Bar chart menunjukkan distribusi data. Nilai tertinggi terdapat pada kategori "${maxLabel}" dengan jumlah ${max}.`;
}

function buildLineChart(xField, yField) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (charts.line) charts.line.destroy();

  const map = new Map();
  rawData.forEach(r => {
    const x = r[xField];
    const y = r[yField];
    if (x === null || y === null) return;
    if (!map.has(x)) map.set(x, []);
    map.get(x).push(y);
  });
  const labels = Array.from(map.keys()).sort();
  const avg = labels.map(l => {
    const arr = map.get(l).filter(v => typeof v === 'number');
    return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
  });

  charts.line = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: yField, data: avg, borderColor: '#3b82f6', fill: false, tension: 0.25 }] },
    options: { responsive: true }
  });

  el.lineExplain.textContent = `Line chart menampilkan tren rata-rata nilai ${yField} terhadap ${xField}. Grafik ini membantu melihat pola kenaikan atau penurunan.`;
}

function buildPieChart(targetField) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (charts.pie) charts.pie.destroy();

  const counts = {};
  rawData.forEach(r => {
    const k = String(r[targetField] ?? 'Unknown');
    counts[k] = (counts[k] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const values = Object.values(counts);

  charts.pie = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#ef4444'] }] },
    options: { responsive: true }
  });

  const max = Math.max(...values);
  const dominant = labels[values.indexOf(max)];
  el.pieExplain.textContent = `Pie chart menunjukkan bahwa kelas "${dominant}" memiliki proporsi terbesar (${max} data).`;
}

function updateInsight(xField, yField) {
  const total = rawData.length;
  el.insightText.textContent = `Total ${total} data telah divisualisasikan. 
  Bar chart menggambarkan distribusi, line chart menampilkan tren, 
  dan pie chart menunjukkan proporsi kelas target.`;
}

async function main() {
  await fetchAndParseCSV();
  populateControls();
  el.xField.value = headers[0];
  el.yField.value = headers[1] || headers[0];
  renderAll();
  el.refreshBtn.addEventListener('click', renderAll);
}

function renderAll() {
  const x = el.xField.value;
  const y = el.yField.value;
  const target = headers.find(h => h.toLowerCase().includes('success')) || headers[0];
  const barData = aggregateForBar(x, y);
  buildBarChart(barData);
  buildLineChart(x, y);
  buildPieChart(target);
  updateInsight(x, y);
}

main();
