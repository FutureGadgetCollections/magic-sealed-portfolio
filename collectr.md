---
layout: default
title: Collectr
description: Browse your sealed collection by set
---

<header class="page-header">
  <h1 class="page-title">Collectr</h1>
  <p class="page-description">Browse your sealed collection by Pokemon set</p>
</header>

<div id="collectr-grid" class="collectr-grid loading">Loading...</div>
<script>
document.addEventListener('DOMContentLoaded', async function() {
  const COLLECTR_URL = window.SITE_CONFIG.sheets.collectr;
  const HOLDINGS_URL = window.SITE_CONFIG.sheets.holdings;
  const BASE_URL = window.SITE_CONFIG.baseurl || '';
  const IMG_PATH = BASE_URL + '/assets/images/';

  function parseTSV(tsv) {
    const lines = tsv.trim().split('\n');
    if (lines.length < 2) return [];
    const rawHeaders = lines[0].split('\t').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    const headerMap = { 'totoal_cost_basis': 'total_cost_basis' };
    const headers = rawHeaders.map(h => headerMap[h] || h);
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row = {};
      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim() : '';
        if (value.startsWith('$') || value.startsWith('-$')) {
          value = value.replace(/[$,]/g, '');
        }
        row[header] = value;
      });
      data.push(row);
    }
    return data;
  }

  const AVAILABLE_IMAGES = new Set(window.SITE_CONFIG.images || []);

  function resolveImage(imgEl, id) {
    if (AVAILABLE_IMAGES.has(id + '.png')) { imgEl.src = IMG_PATH + id + '.png'; }
    else if (AVAILABLE_IMAGES.has(id + '.jpg')) { imgEl.src = IMG_PATH + id + '.jpg'; }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value);
  }

  try {
    const [collectrRes, holdingsRes] = await Promise.all([
      fetch(COLLECTR_URL),
      fetch(HOLDINGS_URL)
    ]);

    const collectrRows = parseTSV(await collectrRes.text());
    const holdings = parseTSV(await holdingsRes.text());

    // Build holdings stats grouped by set
    const setStats = {};
    holdings.forEach(h => {
      const s = h.set;
      if (!setStats[s]) {
        setStats[s] = { products: 0, totalQty: 0, totalCost: 0, totalValue: 0 };
      }
      setStats[s].products++;
      setStats[s].totalQty += parseInt(h.quantity) || 0;
      setStats[s].totalCost += parseFloat(h.total_cost_basis) || 0;
      setStats[s].totalValue += parseFloat(h.total_current_value) || 0;
    });

    const grid = document.getElementById('collectr-grid');
    grid.classList.remove('loading');

    grid.innerHTML = collectrRows.map(row => {
      const stats = setStats[row.name] || { products: 0, totalQty: 0, totalCost: 0, totalValue: 0 };
      const gain = stats.totalValue - stats.totalCost;
      const gainPct = stats.totalCost > 0 ? (gain / stats.totalCost * 100) : 0;
      const gainClass = gain >= 0 ? 'positive' : 'negative';

      return `
        <a href="${row.link}" target="_blank" rel="noopener" class="collectr-card">
          <div class="collectr-card-header">
            <img class="collectr-card-img" data-img-id="${row.id}" src="${IMG_PATH}default.jpg">
            <div class="collectr-card-titles">
              <h2 class="collectr-set-name">${row.name}</h2>
              <span class="collectr-set-id">${row.id}</span>
            </div>
          </div>
          <div class="collectr-card-stats">
            <div class="collectr-stat">
              <span class="collectr-stat-label">Products</span>
              <span class="collectr-stat-value">${stats.products}</span>
            </div>
            <div class="collectr-stat">
              <span class="collectr-stat-label">Total Qty</span>
              <span class="collectr-stat-value">${stats.totalQty}</span>
            </div>
            <div class="collectr-stat">
              <span class="collectr-stat-label">Cost Basis</span>
              <span class="collectr-stat-value">${formatCurrency(stats.totalCost)}</span>
            </div>
            <div class="collectr-stat">
              <span class="collectr-stat-label">Current Value</span>
              <span class="collectr-stat-value">${formatCurrency(stats.totalValue)}</span>
            </div>
            <div class="collectr-stat">
              <span class="collectr-stat-label">Gain/Loss</span>
              <span class="collectr-stat-value ${gainClass}">${gain >= 0 ? '+' : ''}${formatCurrency(gain)} (${gain >= 0 ? '+' : ''}${gainPct.toFixed(1)}%)</span>
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Resolve card images
    grid.querySelectorAll('img[data-img-id]').forEach(img => resolveImage(img, img.dataset.imgId));

  } catch (e) {
    console.error('Error loading collectr data:', e);
    document.getElementById('collectr-grid').innerHTML = '<p>Error loading data</p>';
  }
});
</script>
