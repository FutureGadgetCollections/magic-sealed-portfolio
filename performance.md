---
layout: default
title: Performance
description: Portfolio analytics and IRR calculation
---

<header class="page-header">
  <h1 class="page-title">Performance</h1>
  <p class="page-description">Internal Rate of Return and portfolio analytics</p>
</header>

<div class="irr-display">
  <div class="irr-label">Portfolio Internal Rate of Return (IRR)</div>
  <div class="irr-value" id="portfolio-irr">Calculating...</div>
  <div class="irr-note">
    Annualized return based on all cash flows and current portfolio value
  </div>
</div>

<div class="card" style="margin-bottom: 1.5rem;">
  <h2 class="card-title">Gains Summary</h2>
  <div class="gains-summary">
    <div class="gains-summary-item">
      <span class="gains-summary-label">Realized Gains</span>
      <span class="gains-summary-value" id="realized-gain">Loading...</span>
    </div>
    <div class="gains-summary-item">
      <span class="gains-summary-label">Unrealized Gains</span>
      <span class="gains-summary-value" id="unrealized-gain">Loading...</span>
    </div>
    <div class="gains-summary-item">
      <span class="gains-summary-label">Total Gains</span>
      <span class="gains-summary-value" id="total-gain-all">Loading...</span>
    </div>
  </div>
</div>

<div class="charts-grid">
  <div class="card">
    <h2 class="card-title">Category Performance</h2>
    <div id="category-breakdown" class="loading">Loading...</div>
  </div>

  <div class="card">
    <h2 class="card-title">Transaction History</h2>
    <div id="transaction-timeline" class="loading">Loading...</div>
  </div>
</div>

<div class="card" style="margin-top: 1.5rem;">
  <h2 class="card-title">Realized Gains History</h2>
  <div id="realized-gains-list" class="loading">Loading...</div>
  <div id="sales-table-container"></div>
</div>

<div class="card" style="margin-top: 1.5rem;">
  <h2 class="card-title">Understanding IRR</h2>
  <div style="color: var(--color-gray-600); line-height: 1.7;">
    <p>
      <strong>Internal Rate of Return (IRR)</strong> is the annualized rate at which
      your investments have grown, taking into account the timing and size of all
      cash flows. Unlike simple return calculations, IRR properly weights:
    </p>
    <ul>
      <li>When you bought each item (earlier purchases have more time to compound)</li>
      <li>The size of each investment</li>
      <li>Additional expenses like insurance and storage</li>
      <li>Any income from dividends, partial sales, or distributions</li>
    </ul>
    <p>
      The IRR shown above is calculated using the Newton-Raphson method,
      finding the discount rate that makes the Net Present Value (NPV) of
      all cash flows equal to zero.
    </p>
    <p>
      <strong>How to interpret:</strong> An IRR of 15% means your portfolio
      has performed equivalent to a savings account paying 15% annually,
      compounded. Compare this to benchmark returns like the S&P 500
      (historically ~10% annually) to gauge performance.
    </p>
  </div>
</div>

<div class="card" style="margin-top: 1.5rem;">
  <h2 class="card-title">All Transactions</h2>
  <div id="transactions-table-container">
    <p class="loading">Loading...</p>
  </div>
</div>

<!-- Summary Stats -->
<div class="stats-grid" style="margin-top: 2rem;">
  <div class="stat-card">
    <span class="stat-label">Total Invested</span>
    <span class="stat-value" id="total-invested">-</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Income</span>
    <span class="stat-value positive" id="total-income">-</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Expenses</span>
    <span class="stat-value negative" id="total-expenses">-</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Realized Gains</span>
    <span class="stat-value" id="total-realized">-</span>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async function() {
  const SHEETS = window.SITE_CONFIG.sheets;

  function parseTSV(tsv) {
    const lines = tsv.trim().split('\n');
    if (lines.length < 2) return [];
    const rawHeaders = lines[0].split('\t').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    const headerMap = {
      'deposit/withdrawal': 'amount',
      'transaction_type': 'type',
      'date_aquired': 'date_acquired'
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

  function parseDate(dateStr) {
    if (!dateStr) return new Date();
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
    if (dateStr.includes('-') && dateStr.split('-')[0].length <= 2) {
      const parts = dateStr.split('-');
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  try {
    const [txResponse, salesResponse] = await Promise.all([
      fetch(SHEETS.transactions),
      fetch(SHEETS.sales)
    ]);

    const transactions = parseTSV(await txResponse.text());
    const sales = parseTSV(await salesResponse.text());

    // Build transactions table
    const txContainer = document.getElementById('transactions-table-container');
    const sortedTx = [...transactions].sort((a, b) => parseDate(b.date) - parseDate(a.date));

    let totalInvested = 0, totalIncome = 0, totalExpenses = 0;

    let txHtml = `
      <div class="table-container" style="box-shadow: none;">
        <table class="holdings-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
    `;

    sortedTx.forEach(tx => {
      const amount = parseFloat(tx.amount) || 0;
      const type = tx.type || '';

      if (type === 'Deposit') totalInvested += Math.abs(amount);
      else if (type === 'Withdrawal' || type === 'DIVIDEND') totalIncome += amount;
      else if (type === 'EXPENSE') totalExpenses += Math.abs(amount);

      const amountClass = amount >= 0 ? 'positive' : 'negative';
      const typeClass = type.toLowerCase();

      txHtml += `
        <tr>
          <td>${tx.date || ''}</td>
          <td><span class="transaction-type ${typeClass}">${type}</span></td>
          <td>${tx.notes || ''}</td>
          <td class="value-cell ${amountClass}">${amount >= 0 ? '+' : ''}${formatCurrency(amount)}</td>
        </tr>
      `;
    });

    txHtml += '</tbody></table></div>';
    txContainer.innerHTML = txHtml;

    // Build sales table
    const salesContainer = document.getElementById('sales-table-container');
    let totalRealized = 0;

    if (sales.length > 0) {
      const sortedSales = [...sales].sort((a, b) => parseDate(b.date) - parseDate(a.date));

      let salesHtml = `
        <div class="table-container" style="box-shadow: none; margin-top: 1rem;">
          <table class="holdings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>ID</th>
                <th>Cost Basis</th>
                <th>Sale Price</th>
                <th>Realized Gain</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
      `;

      sortedSales.forEach(sale => {
        const costBasis = parseFloat(sale.cost_basis) || 0;
        const salePrice = parseFloat(sale.sale_price) || 0;
        const gain = salePrice - costBasis;
        totalRealized += gain;

        const gainClass = gain >= 0 ? 'positive' : 'negative';

        salesHtml += `
          <tr>
            <td>${sale.date || ''}</td>
            <td class="name-cell">${sale.id || ''}</td>
            <td class="value-cell">${formatCurrency(costBasis)}</td>
            <td class="value-cell">${formatCurrency(salePrice)}</td>
            <td class="value-cell ${gainClass}">${gain >= 0 ? '+' : ''}${formatCurrency(gain)}</td>
            <td>${sale.notes || ''}</td>
          </tr>
        `;
      });

      salesHtml += '</tbody></table></div>';
      salesContainer.innerHTML = salesHtml;
    }

    // Update summary stats
    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);

    const totalRealizedEl = document.getElementById('total-realized');
    totalRealizedEl.textContent = `${totalRealized >= 0 ? '+' : ''}${formatCurrency(totalRealized)}`;
    totalRealizedEl.classList.add(totalRealized >= 0 ? 'positive' : 'negative');

  } catch (e) {
    console.error('Error loading performance data:', e);
  }
});
</script>
