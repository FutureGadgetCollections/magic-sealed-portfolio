---
layout: default
title: Holdings
description: Complete list of portfolio holdings
---

<header class="page-header">
  <h1 class="page-title">Holdings</h1>
  <p class="page-description">All Pokemon sealed products with current values and performance</p>
</header>

<div class="holdings-controls">
  <input type="text" id="holdings-search" class="search-input" placeholder="Search holdings...">
  <div class="filter-buttons" id="filter-buttons">
    <button class="filter-btn active" data-set="all">All</button>
    <!-- Filter buttons will be added dynamically -->
  </div>
</div>

<div class="table-container">
  <table class="holdings-table">
    <thead>
      <tr>
        <th data-sort="name">Name</th>
        <th data-sort="set">Set</th>
        <th data-sort="location">Location</th>
        <th data-sort="qty">Qty</th>
        <th data-sort="unitcost">Avg Unit Cost</th>
        <th data-sort="cost">Total Cost</th>
        <th data-sort="unitvalue">Unit Value</th>
        <th data-sort="value">Total Value</th>
        <th data-sort="gain">Gain/Loss</th>
        <th data-sort="gainpct">Gain %</th>
        <th data-sort="lastchecked">Last Checked</th>
      </tr>
    </thead>
    <tbody id="holdings-table-body">
      <tr><td colspan="11" class="loading">Loading...</td></tr>
    </tbody>
  </table>
</div>

<!-- Summary -->
<div class="stats-grid" style="margin-top: 2rem;">
  <div class="stat-card">
    <span class="stat-label">Total Holdings</span>
    <span class="stat-value" id="holdings-count">-</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Cost</span>
    <span class="stat-value" id="total-cost">-</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Value</span>
    <span class="stat-value" id="total-value">-</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Gain/Loss</span>
    <span class="stat-value" id="total-gain">-</span>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async function() {
  const HOLDINGS_URL = window.SITE_CONFIG.sheets.holdings;
  const BASE_URL = window.SITE_CONFIG.baseurl || '';
  const IMG_PATH = BASE_URL + '/assets/images/';

  function parseTSV(tsv) {
    const lines = tsv.trim().split('\n');
    if (lines.length < 2) return [];
    const rawHeaders = lines[0].split('\t').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    const headerMap = {
      'totoal_cost_basis': 'total_cost_basis'
    };
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
    const response = await fetch(HOLDINGS_URL);
    const text = await response.text();
    const holdings = parseTSV(text);

    // Build filter buttons by set
    const sets = [...new Set(holdings.map(h => h.set))].sort();
    const filterContainer = document.getElementById('filter-buttons');
    const urlSet = new URLSearchParams(window.location.search).get('set');
    sets.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.set = s;
      btn.textContent = s;
      if (urlSet === s) {
        btn.classList.add('active');
        filterContainer.querySelector('[data-set="all"]').classList.remove('active');
      }
      filterContainer.appendChild(btn);
    });

    // Apply initial filter from URL
    if (urlSet) {
      const rows = document.getElementById('holdings-table-body').querySelectorAll('tr');
      rows.forEach(row => {
        row.style.display = row.dataset.set === urlSet ? '' : 'none';
      });
    }

    // Build table rows
    const tbody = document.getElementById('holdings-table-body');
    let totalCost = 0, totalValue = 0;

    tbody.innerHTML = holdings.map(h => {
      const qty = parseInt(h.quantity) || 0;
      const unitCost = parseFloat(h.average_unit_cost) || 0;
      const cost = parseFloat(h.total_cost_basis) || 0;
      const unitValue = parseFloat(h.current_unit_value) || 0;
      const value = parseFloat(h.total_current_value) || 0;
      const gain = value - cost;
      const gainPct = cost > 0 ? (gain / cost * 100) : 0;
      totalCost += cost;
      totalValue += value;

      return `
        <tr data-set="${h.set}"
            data-name="${h.name}"
            data-location="${h.location}"
            data-qty="${qty}"
            data-unitcost="${unitCost}"
            data-cost="${cost}"
            data-unitvalue="${unitValue}"
            data-value="${value}"
            data-gain="${gain}"
            data-gainpct="${gainPct}"
            data-lastchecked="${h.last_checked_date || ''}"
            data-notes="${h.notes || ''}">
          <td class="name-cell"><img class="product-img" data-img-id="${h.id}" src="${IMG_PATH}default.jpg">${h.name}</td>
          <td><span class="category-badge">${h.set}</span></td>
          <td>${h.location}</td>
          <td class="value-cell">${qty}</td>
          <td class="value-cell">${formatCurrency(unitCost)}</td>
          <td class="value-cell">${formatCurrency(cost)}</td>
          <td class="value-cell">${formatCurrency(unitValue)}</td>
          <td class="value-cell">${formatCurrency(value)}</td>
          <td class="value-cell ${gain >= 0 ? 'positive' : 'negative'}">
            ${gain >= 0 ? '+' : ''}${formatCurrency(gain)}
          </td>
          <td class="value-cell ${gainPct >= 0 ? 'positive' : 'negative'}">
            ${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%
          </td>
          <td>${h.last_checked_date || ''}</td>
        </tr>
      `;
    }).join('');

    // Resolve product images
    tbody.querySelectorAll('img[data-img-id]').forEach(img => resolveImage(img, img.dataset.imgId));

    // Update summary stats
    const totalGain = totalValue - totalCost;
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost * 100) : 0;
    document.getElementById('holdings-count').textContent = holdings.length;
    document.getElementById('total-cost').textContent = formatCurrency(totalCost);
    document.getElementById('total-value').textContent = formatCurrency(totalValue);
    const gainEl = document.getElementById('total-gain');
    gainEl.innerHTML = `${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)} <small>(${totalGain >= 0 ? '+' : ''}${totalGainPct.toFixed(1)}%)</small>`;
    gainEl.classList.add(totalGain >= 0 ? 'positive' : 'negative');

  } catch (e) {
    console.error('Error loading holdings:', e);
    document.getElementById('holdings-table-body').innerHTML = '<tr><td colspan="11">Error loading data</td></tr>';
  }
});
</script>
