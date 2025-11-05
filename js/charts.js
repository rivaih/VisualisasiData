// === Helper: Ambil Top N Genre ===
function getTopGenres(data, n = 10) {
  const genreCount = {};
  data.forEach(movie => {
    const genres = movie.Genre.split(',').map(g => g.trim());
    genres.forEach(g => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// === Bar Chart: Top Genre ===
function renderGenreBarChart(data, topN = 10) {
  const topGenres = getTopGenres(data, topN);
  const labels = topGenres.map(g => g[0]);
  const values = topGenres.map(g => g[1]);

  const trace = {
    x: labels,
    y: values,
    type: 'bar',
    marker: { color: '#636EFA' },
    hovertemplate: '<b>%{x}</b><br>Film: %{y}<extra></extra>'
  };

  const layout = {
    title: `Top ${topN} Genre dengan Jumlah Film Terbanyak`,
    xaxis: { title: 'Genre' },
    yaxis: { title: 'Jumlah Film' }
  };

  Plotly.newPlot('genre-bar', [trace], layout);
}

// === Histogram: Distribusi Rating ===
function renderRatingHistogram(data, yearFrom = 1980, yearTo = 2020) {
  const filtered = data.filter(movie => {
    const y = parseInt(movie.Released_Year);
    return !isNaN(y) && y >= yearFrom && y <= yearTo;
  });

  const ratings = filtered.map(m => parseFloat(m.IMDB_Rating)).filter(r => !isNaN(r));

  const trace = {
    x: ratings,
    type: 'histogram',
    nbinsx: 20,
    marker: { color: '#EF553B' },
    hovertemplate: 'Rating: %{x}<br>Jumlah Film: %{y}<extra></extra>'
  };

  const layout = {
    title: `Distribusi Rating IMDb (${yearFrom}–${yearTo})`,
    xaxis: { title: 'Rating IMDb' },
    yaxis: { title: 'Frekuensi (Jumlah Film)' }
  };

  Plotly.newPlot('rating-histogram', [trace], layout);
}

// === Scatter Plot: Rating vs Gross ===
function renderRatingVsGross(data) {
  const points = data
    .map(movie => {
      const r = parseFloat(movie.IMDB_Rating);
      const g = parseGross(movie.Gross);
      return { rating: r, gross: g, title: movie.Series_Title };
    })
    .filter(p => !isNaN(p.rating) && p.gross !== null);

  const trace = {
    x: points.map(p => p.rating),
    y: points.map(p => p.gross),
    mode: 'markers',
    type: 'scatter',
    marker: { size: 8, color: '#AB63FA' },
    text: points.map(p => p.title),
    hovertemplate: '<b>%{text}</b><br>Rating: %{x}<br>Gross: $%{y:,}<extra></extra>'
  };

  const layout = {
    title: 'Rating IMDb vs Pendapatan Box Office',
    xaxis: { title: 'Rating IMDb' },
    yaxis: { title: 'Pendapatan (USD)', type: 'log' }
  };

  Plotly.newPlot('rating-vs-gross', [trace], layout);
}
// === Line Chart: Jumlah Film per Tahun ===
function renderFilmPerYear(data, yearFrom = 1980, yearTo = 2020) {
  const yearCount = {};
  data.forEach(movie => {
    const y = parseInt(movie.Released_Year);
    if (!isNaN(y) && y >= yearFrom && y <= yearTo) {
      yearCount[y] = (yearCount[y] || 0) + 1;
    }
  });

  const years = Object.keys(yearCount).map(Number).sort((a, b) => a - b);
  const counts = years.map(y => yearCount[y]);

  const trace = {
    x: years,
    y: counts,
    mode: 'lines+markers',
    line: { color: '#00CC96' },
    marker: { size: 6 },
    hovertemplate: 'Tahun: %{x}<br>Jumlah Film: %{y}<extra></extra>'
  };

  const layout = {
    title: `Jumlah Film per Tahun (${yearFrom}–${yearTo})`,
    xaxis: { title: 'Tahun' },
    yaxis: { title: 'Jumlah Film' }
  };

  Plotly.newPlot('film-per-year', [trace], layout);
}

// === Pie Chart: Persentase Genre Film ===
function renderGenrePie(data) {
  const genreCount = {};
  data.forEach(movie => {
    const genres = movie.Genre.split(',').map(g => g.trim());
    genres.forEach(g => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });

  const labels = Object.keys(genreCount);
  const values = Object.values(genreCount);

  const trace = {
    labels: labels,
    values: values,
    type: 'pie',
    textinfo: 'label+percent',
    textposition: 'inside',
    automargin: true,
    hovertemplate: '%{label}: %{value} film (%{percent})<extra></extra>',
    insidetextorientation: 'radial' // opsional: teks mengikuti bentuk lingkaran
  };

  const layout = {
    title: 'Persentase Genre Film',
    height: 450, // Sesuaikan dengan height di HTML
    margin: { t: 50, b: 40, l: 40, r: 40 }
  };

  Plotly.newPlot('genre-pie', [trace], layout);
}
document.addEventListener('DOMContentLoaded', () => {
  // Render awal
  renderGenreBarChart(imdbData, 10);
  renderRatingHistogram(imdbData, 1980, 2020);
  renderRatingVsGross(imdbData);
  renderFilmPerYear(imdbData, 1980, 2020);
  renderGenrePie(imdbData);

  // Event: Top N Genre
  document.getElementById('genreTopFilter').addEventListener('change', (e) => {
    const topN = parseInt(e.target.value);
    renderGenreBarChart(imdbData, topN);
  });

  // Event: Histogram tahun
  const histFrom = document.getElementById('yearFrom');
  const histTo = document.getElementById('yearTo');
  const updateHist = () => {
    const from = parseInt(histFrom.value) || 1980;
    const to = parseInt(histTo.value) || 2020;
    if (from <= to) renderRatingHistogram(imdbData, from, to);
  };
  histFrom.addEventListener('input', updateHist);
  histTo.addEventListener('input', updateHist);

  // Event: Line Chart tahun
  const lineFrom = document.getElementById('yearFromLine');
  const lineTo = document.getElementById('yearToLine');
  const updateLine = () => {
    const from = parseInt(lineFrom.value) || 1980;
    const to = parseInt(lineTo.value) || 2020;
    if (from <= to) renderFilmPerYear(imdbData, from, to);
  };
  lineFrom.addEventListener('input', updateLine);
  lineTo.addEventListener('input', updateLine);
});