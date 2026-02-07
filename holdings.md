---
layout: default
title: Holdings
description: Complete list of portfolio holdings
---

<header class="page-header">
  <h1 class="page-title">Holdings</h1>
  <p class="page-description">All crypto cash flow positions with current values and performance</p>
</header>

<div class="holdings-controls">
  <input type="text" id="holdings-search" class="search-input" placeholder="Search holdings...">
  <div class="filter-buttons" id="filter-buttons">
    <button class="filter-btn active" data-category="all">All</button>
    <!-- Filter buttons will be added dynamically -->
  </div>
</div>

<div class="table-container">
  <table class="holdings-table">
    <thead>
      <tr>
        <th data-sort="name">Name</th>
        <th data-sort="category">Category</th>
        <th data-sort="network">Network</th>
        <th data-sort="status">Status</th>
        <th data-sort="cost">Cost Basis</th>
        <th data-sort="value">Current Value</th>
        <th data-sort="gain">Gain/Loss</th>
        <th data-sort="gainpct">Gain %</th>
        <th data-sort="date">Date Acquired</th>
        <th data-sort="lastchecked">Last Checked</th>
      </tr>
    </thead>
    <tbody id="holdings-table-body">
      <tr><td colspan="10" class="loading">Loading...</td></tr>
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

  function parseTSV(tsv) {
    const lines = tsv.trim().split('\n');
    if (lines.length < 2) return [];
    const rawHeaders = lines[0].split('\t').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    const headerMap = {
      'deposit/withdrawal': 'amount',
      'transaction_type': 'type',
      'date_aquired': 'date_acquired',
      'last_checked_date': 'last_checked_date'
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

    // Build filter buttons
    const categories = [...new Set(holdings.map(h => h.category))].sort();
    const filterContainer = document.getElementById('filter-buttons');
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat;
      btn.textContent = cat;
      filterContainer.appendChild(btn);
    });

    // Build table rows
    const tbody = document.getElementById('holdings-table-body');
    let totalCost = 0, totalValue = 0;

    tbody.innerHTML = holdings.map(h => {
      const cost = parseFloat(h.cost_basis) || 0;
      const value = parseFloat(h.current_value) || 0;
      const gain = value - cost;
      const gainPct = cost > 0 ? (gain / cost * 100) : 0;
      totalCost += cost;
      totalValue += value;

      return `
        <tr data-category="${h.category}"
            data-name="${h.name}"
            data-network="${h.network}"
            data-status="${h.status}"
            data-cost="${cost}"
            data-value="${value}"
            data-gain="${gain}"
            data-gainpct="${gainPct}"
            data-date="${h.date_acquired}"
            data-lastchecked="${h.last_checked_date || ''}"
            data-notes="${h.notes || ''}">
          <td class="name-cell">${h.name}</td>
          <td><span class="category-badge">${h.category}</span></td>
          <td><span class="network-badge">${h.network}</span></td>
          <td><span class="status-badge status-${h.status}">${h.status}</span></td>
          <td class="value-cell">${formatCurrency(cost)}</td>
          <td class="value-cell">${formatCurrency(value)}</td>
          <td class="value-cell ${gain >= 0 ? 'positive' : 'negative'}">
            ${gain >= 0 ? '+' : ''}${formatCurrency(gain)}
          </td>
          <td class="value-cell ${gainPct >= 0 ? 'positive' : 'negative'}">
            ${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%
          </td>
          <td>${h.date_acquired}</td>
          <td>${h.last_checked_date || ''}</td>
        </tr>
      `;
    }).join('');

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
    document.getElementById('holdings-table-body').innerHTML = '<tr><td colspan="10">Error loading data</td></tr>';
  }
});
</script>
