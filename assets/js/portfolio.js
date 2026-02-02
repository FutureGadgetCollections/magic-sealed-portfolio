/**
 * Portfolio JavaScript - IRR Calculation and Interactivity
 */

(function() {
  'use strict';

  // Mobile navigation toggle
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (mobileNavToggle && siteNav) {
    mobileNavToggle.addEventListener('click', function() {
      siteNav.classList.toggle('open');
    });
  }

  /**
   * Calculate IRR using Newton-Raphson method
   * @param {Array} cashFlows - Array of {date: Date, amount: number}
   * @param {number} guess - Initial guess (default 0.1 = 10%)
   * @returns {number|null} - IRR as decimal or null if not converged
   */
  function calculateIRR(cashFlows, guess = 0.1) {
    if (!cashFlows || cashFlows.length < 2) return null;

    // Sort by date
    const sorted = [...cashFlows].sort((a, b) => a.date - b.date);
    const firstDate = sorted[0].date;

    // Convert dates to years from first date
    const flows = sorted.map(cf => ({
      years: (cf.date - firstDate) / (365.25 * 24 * 60 * 60 * 1000),
      amount: cf.amount
    }));

    // Newton-Raphson iteration
    let rate = guess;
    const maxIterations = 100;
    const tolerance = 1e-7;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;

      for (const flow of flows) {
        const discountFactor = Math.pow(1 + rate, -flow.years);
        npv += flow.amount * discountFactor;
        derivative -= flow.years * flow.amount * Math.pow(1 + rate, -flow.years - 1);
      }

      if (Math.abs(derivative) < 1e-10) {
        // Derivative too small, try different approach
        rate += 0.01;
        continue;
      }

      const newRate = rate - npv / derivative;

      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }

      rate = newRate;

      // Bound the rate to reasonable values
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }

    // Try bisection method if Newton-Raphson failed
    return bisectionIRR(flows);
  }

  /**
   * Bisection method as fallback for IRR calculation
   */
  function bisectionIRR(flows) {
    let low = -0.99;
    let high = 10;
    const maxIterations = 100;
    const tolerance = 1e-6;

    function npv(rate) {
      return flows.reduce((sum, flow) => {
        return sum + flow.amount * Math.pow(1 + rate, -flow.years);
      }, 0);
    }

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const npvMid = npv(mid);

      if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) {
        return mid;
      }

      if (npv(low) * npvMid < 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return null;
  }

  /**
   * Format number as currency
   */
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Format number as percentage
   */
  function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  /**
   * Parse date string to Date object
   */
  function parseDate(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /**
   * Initialize IRR calculation on performance page
   */
  function initIRR() {
    const irrElement = document.getElementById('portfolio-irr');
    const transactionsData = document.getElementById('transactions-data');

    if (!irrElement || !transactionsData) return;

    try {
      const transactions = JSON.parse(transactionsData.textContent);
      const holdingsData = document.getElementById('holdings-data');
      const holdings = holdingsData ? JSON.parse(holdingsData.textContent) : [];

      // Build cash flows array
      const cashFlows = [];

      // Add all transactions
      transactions.forEach(t => {
        cashFlows.push({
          date: parseDate(t.date),
          amount: parseFloat(t.amount)
        });
      });

      // Add current values as terminal cash flow (today)
      const today = new Date();
      const totalCurrentValue = holdings.reduce((sum, h) => sum + parseFloat(h.current_value), 0);

      if (totalCurrentValue > 0) {
        cashFlows.push({
          date: today,
          amount: totalCurrentValue
        });
      }

      // Calculate IRR
      const irr = calculateIRR(cashFlows);

      if (irr !== null && isFinite(irr)) {
        irrElement.textContent = formatPercent(irr);
        irrElement.classList.add(irr >= 0 ? 'positive' : 'negative');
      } else {
        irrElement.textContent = 'N/A';
      }
    } catch (e) {
      console.error('Error calculating IRR:', e);
      irrElement.textContent = 'Error';
    }
  }

  /**
   * Initialize holdings table filtering and sorting
   */
  function initHoldingsTable() {
    const searchInput = document.getElementById('holdings-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const table = document.querySelector('.holdings-table');

    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    let currentFilter = 'all';
    let currentSort = { column: null, direction: 'asc' };

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        filterRows();
      });
    }

    // Category filter buttons
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.category;
        filterRows();
      });
    });

    // Sort functionality
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
      header.addEventListener('click', function() {
        const column = this.dataset.sort;

        // Toggle direction if same column
        if (currentSort.column === column) {
          currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.column = column;
          currentSort.direction = 'asc';
        }

        // Update header classes
        headers.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
        this.classList.add('sorted-' + currentSort.direction);

        sortRows();
      });
    });

    function filterRows() {
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

      rows.forEach(row => {
        const name = row.querySelector('.name-cell')?.textContent.toLowerCase() || '';
        const category = row.dataset.category || '';
        const notes = row.dataset.notes?.toLowerCase() || '';

        const matchesSearch = !searchTerm ||
          name.includes(searchTerm) ||
          category.toLowerCase().includes(searchTerm) ||
          notes.includes(searchTerm);

        const matchesFilter = currentFilter === 'all' || category === currentFilter;

        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
      });
    }

    function sortRows() {
      const sortedRows = [...rows].sort((a, b) => {
        let aVal = a.dataset[currentSort.column] || '';
        let bVal = b.dataset[currentSort.column] || '';

        // Try to parse as numbers
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return currentSort.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        return currentSort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });

      sortedRows.forEach(row => tbody.appendChild(row));
    }
  }

  /**
   * Initialize category breakdown chart (simple bar representation)
   */
  function initCategoryBreakdown() {
    const container = document.getElementById('category-breakdown');
    const holdingsData = document.getElementById('holdings-data');

    if (!container || !holdingsData) return;

    try {
      const holdings = JSON.parse(holdingsData.textContent);

      // Group by category
      const categories = {};
      holdings.forEach(h => {
        const cat = h.category;
        if (!categories[cat]) {
          categories[cat] = { value: 0, cost: 0 };
        }
        categories[cat].value += parseFloat(h.current_value);
        categories[cat].cost += parseFloat(h.cost_basis);
      });

      // Calculate total
      const totalValue = Object.values(categories).reduce((sum, c) => sum + c.value, 0);

      // Build HTML
      let html = '<ul class="category-list">';
      Object.entries(categories)
        .sort((a, b) => b[1].value - a[1].value)
        .forEach(([name, data]) => {
          const percentage = (data.value / totalValue * 100).toFixed(1);
          const gainLoss = data.value - data.cost;
          const gainLossClass = gainLoss >= 0 ? 'positive' : 'negative';

          html += `
            <li class="category-item">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span class="category-name">${name}</span>
                  <span class="category-value">${formatCurrency(data.value)} (${percentage}%)</span>
                </div>
                <div class="category-bar">
                  <div class="category-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <small class="${gainLossClass}" style="font-size: 0.75rem;">
                  ${gainLoss >= 0 ? '+' : ''}${formatCurrency(gainLoss)} gain/loss
                </small>
              </div>
            </li>
          `;
        });
      html += '</ul>';

      container.innerHTML = html;
    } catch (e) {
      console.error('Error building category breakdown:', e);
    }
  }

  /**
   * Initialize top movers display
   */
  function initTopMovers() {
    const gainersContainer = document.getElementById('top-gainers');
    const losersContainer = document.getElementById('top-losers');
    const holdingsData = document.getElementById('holdings-data');

    if ((!gainersContainer && !losersContainer) || !holdingsData) return;

    try {
      const holdings = JSON.parse(holdingsData.textContent);

      // Calculate gain/loss percentage for each
      const withGains = holdings.map(h => {
        const cost = parseFloat(h.cost_basis);
        const value = parseFloat(h.current_value);
        const gainLoss = value - cost;
        const gainLossPct = cost > 0 ? (gainLoss / cost) : 0;
        return { ...h, gainLoss, gainLossPct };
      });

      // Sort by percentage
      const sorted = [...withGains].sort((a, b) => b.gainLossPct - a.gainLossPct);

      // Top gainers (top 3)
      if (gainersContainer) {
        const gainers = sorted.slice(0, 3);
        gainersContainer.innerHTML = gainers.map(h => `
          <div class="mover-item">
            <div class="mover-info">
              <span class="mover-name">${h.name}</span>
              <span class="mover-category">${h.category}</span>
            </div>
            <span class="mover-change positive">+${(h.gainLossPct * 100).toFixed(1)}%</span>
          </div>
        `).join('');
      }

      // Top losers (bottom 3, reversed)
      if (losersContainer) {
        const losers = sorted.slice(-3).reverse();
        losersContainer.innerHTML = losers.map(h => {
          const pctClass = h.gainLossPct >= 0 ? 'positive' : 'negative';
          const sign = h.gainLossPct >= 0 ? '+' : '';
          return `
            <div class="mover-item">
              <div class="mover-info">
                <span class="mover-name">${h.name}</span>
                <span class="mover-category">${h.category}</span>
              </div>
              <span class="mover-change ${pctClass}">${sign}${(h.gainLossPct * 100).toFixed(1)}%</span>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.error('Error building top movers:', e);
    }
  }

  /**
   * Initialize transaction timeline
   */
  function initTransactionTimeline() {
    const container = document.getElementById('transaction-timeline');
    const transactionsData = document.getElementById('transactions-data');

    if (!container || !transactionsData) return;

    try {
      const transactions = JSON.parse(transactionsData.textContent);

      // Sort by date descending (most recent first)
      const sorted = [...transactions].sort((a, b) => {
        return parseDate(b.date) - parseDate(a.date);
      });

      // Build HTML
      let html = '<div class="transactions-list">';
      sorted.slice(0, 20).forEach(t => {
        const amount = parseFloat(t.amount);
        const amountClass = amount >= 0 ? 'positive' : 'negative';
        const typeClass = t.type.toLowerCase();

        html += `
          <div class="transaction-item">
            <div class="transaction-info">
              <span class="transaction-type ${typeClass}">${t.type}</span>
              <span class="transaction-desc">${t.description}</span>
              <span class="transaction-date">${t.date}</span>
            </div>
            <span class="transaction-amount ${amountClass}">
              ${amount >= 0 ? '+' : ''}${formatCurrency(amount)}
            </span>
          </div>
        `;
      });
      html += '</div>';

      container.innerHTML = html;
    } catch (e) {
      console.error('Error building transaction timeline:', e);
    }
  }

  /**
   * Calculate and display portfolio summary stats
   */
  function initSummaryStats() {
    const holdingsData = document.getElementById('holdings-data');
    if (!holdingsData) return;

    try {
      const holdings = JSON.parse(holdingsData.textContent);
      const salesData = document.getElementById('sales-data');
      const sales = salesData ? JSON.parse(salesData.textContent) : [];

      let totalCost = 0;
      let totalValue = 0;

      holdings.forEach(h => {
        totalCost += parseFloat(h.cost_basis);
        totalValue += parseFloat(h.current_value);
      });

      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) : 0;

      // Calculate realized gains from sales
      let totalRealizedGain = 0;
      let totalSaleProceeds = 0;
      let totalCostBasisSold = 0;

      sales.forEach(s => {
        const proceeds = parseFloat(s.sale_proceeds);
        const costBasis = parseFloat(s.cost_basis_sold);
        totalSaleProceeds += proceeds;
        totalCostBasisSold += costBasis;
        totalRealizedGain += proceeds - costBasis;
      });

      // Update stat elements if they exist
      const costEl = document.getElementById('total-cost');
      const valueEl = document.getElementById('total-value');
      const gainEl = document.getElementById('total-gain');
      const countEl = document.getElementById('holdings-count');
      const realizedEl = document.getElementById('realized-gain');
      const unrealizedEl = document.getElementById('unrealized-gain');
      const totalGainEl = document.getElementById('total-gain-all');

      if (costEl) costEl.textContent = formatCurrency(totalCost);
      if (valueEl) valueEl.textContent = formatCurrency(totalValue);
      if (gainEl) {
        gainEl.textContent = `${totalGainLoss >= 0 ? '+' : ''}${formatCurrency(totalGainLoss)} (${formatPercent(totalGainLossPct)})`;
        gainEl.classList.add(totalGainLoss >= 0 ? 'positive' : 'negative');
      }
      if (countEl) countEl.textContent = holdings.length;

      // Realized gains display
      if (realizedEl) {
        realizedEl.textContent = `${totalRealizedGain >= 0 ? '+' : ''}${formatCurrency(totalRealizedGain)}`;
        realizedEl.classList.add(totalRealizedGain >= 0 ? 'positive' : 'negative');
      }

      // Unrealized gains display
      if (unrealizedEl) {
        unrealizedEl.textContent = `${totalGainLoss >= 0 ? '+' : ''}${formatCurrency(totalGainLoss)}`;
        unrealizedEl.classList.add(totalGainLoss >= 0 ? 'positive' : 'negative');
      }

      // Total gains (realized + unrealized)
      const combinedGain = totalRealizedGain + totalGainLoss;
      if (totalGainEl) {
        totalGainEl.textContent = `${combinedGain >= 0 ? '+' : ''}${formatCurrency(combinedGain)}`;
        totalGainEl.classList.add(combinedGain >= 0 ? 'positive' : 'negative');
      }

    } catch (e) {
      console.error('Error calculating summary stats:', e);
    }
  }

  /**
   * Initialize realized gains display
   */
  function initRealizedGains() {
    const container = document.getElementById('realized-gains-list');
    const salesData = document.getElementById('sales-data');

    if (!container || !salesData) return;

    try {
      const sales = JSON.parse(salesData.textContent);

      if (sales.length === 0) {
        container.innerHTML = '<p class="no-data">No sales recorded yet.</p>';
        return;
      }

      // Sort by date descending
      const sorted = [...sales].sort((a, b) => parseDate(b.date_sold) - parseDate(a.date_sold));

      let html = '<div class="sales-list">';
      sorted.forEach(s => {
        const proceeds = parseFloat(s.sale_proceeds);
        const costBasis = parseFloat(s.cost_basis_sold);
        const gain = proceeds - costBasis;
        const gainPct = costBasis > 0 ? (gain / costBasis) : 0;
        const gainClass = gain >= 0 ? 'positive' : 'negative';

        html += `
          <div class="sale-item">
            <div class="sale-info">
              <span class="sale-holding">${s.holding_id}</span>
              <span class="sale-date">${s.date_sold}</span>
              <span class="sale-notes">${s.notes || ''}</span>
            </div>
            <div class="sale-numbers">
              <div class="sale-detail">
                <span class="detail-label">Proceeds</span>
                <span class="detail-value">${formatCurrency(proceeds)}</span>
              </div>
              <div class="sale-detail">
                <span class="detail-label">Cost Basis</span>
                <span class="detail-value">${formatCurrency(costBasis)}</span>
              </div>
              <div class="sale-detail">
                <span class="detail-label">Realized Gain</span>
                <span class="detail-value ${gainClass}">${gain >= 0 ? '+' : ''}${formatCurrency(gain)} (${formatPercent(gainPct)})</span>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';

      container.innerHTML = html;
    } catch (e) {
      console.error('Error building realized gains list:', e);
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initSummaryStats();
    initIRR();
    initHoldingsTable();
    initCategoryBreakdown();
    initTopMovers();
    initTransactionTimeline();
    initRealizedGains();
  });

})();
