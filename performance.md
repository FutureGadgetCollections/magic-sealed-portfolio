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

  {% if site.data.sales.size > 0 %}
  <div class="table-container" style="box-shadow: none; margin-top: 1rem;">
    <table class="holdings-table">
      <thead>
        <tr>
          <th>Date Sold</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Proceeds</th>
          <th>Cost Basis</th>
          <th>Realized Gain</th>
        </tr>
      </thead>
      <tbody>
        {% assign sorted_sales = site.data.sales | sort: "date_sold" | reverse %}
        {% for sale in sorted_sales %}
        {% assign sale_gain = sale.sale_proceeds | minus: sale.cost_basis_sold | plus: 0 %}
        <tr>
          <td>{{ sale.date_sold }}</td>
          <td class="name-cell">{{ sale.holding_id }}</td>
          <td>{{ sale.quantity_sold }}</td>
          <td class="value-cell">${{ sale.sale_proceeds }}</td>
          <td class="value-cell">${{ sale.cost_basis_sold }}</td>
          <td class="value-cell {% if sale_gain >= 0 %}positive{% else %}negative{% endif %}">
            {% if sale_gain >= 0 %}+{% endif %}${{ sale_gain }}
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
  {% endif %}
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
        {% assign sorted_transactions = site.data.transactions | sort: "date" | reverse %}
        {% for tx in sorted_transactions %}
        {% assign tx_amount = tx.amount | plus: 0 %}
        <tr>
          <td>{{ tx.date }}</td>
          <td>
            <span class="transaction-type {% if tx.type == 'BUY' %}buy{% elsif tx.type == 'SELL' or tx.type == 'DIVIDEND' %}sell{% else %}expense{% endif %}">
              {{ tx.type }}
            </span>
          </td>
          <td>{{ tx.description }}</td>
          <td class="value-cell {% if tx_amount >= 0 %}positive{% else %}negative{% endif %}">
            {% if tx_amount >= 0 %}+{% endif %}${{ tx.amount }}
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>

<!-- Summary Stats -->
<div class="stats-grid" style="margin-top: 2rem;">
  {% assign total_invested = 0 %}
  {% assign total_income = 0 %}
  {% assign total_expenses = 0 %}
  {% for tx in site.data.transactions %}
    {% if tx.type == 'BUY' %}
      {% assign total_invested = total_invested | plus: tx.amount | times: -1 %}
    {% elsif tx.type == 'SELL' or tx.type == 'DIVIDEND' %}
      {% assign total_income = total_income | plus: tx.amount %}
    {% elsif tx.type == 'EXPENSE' %}
      {% assign total_expenses = total_expenses | plus: tx.amount | times: -1 %}
    {% endif %}
  {% endfor %}

  {% assign total_realized = 0 %}
  {% for sale in site.data.sales %}
    {% assign sale_gain = sale.sale_proceeds | minus: sale.cost_basis_sold %}
    {% assign total_realized = total_realized | plus: sale_gain %}
  {% endfor %}

  <div class="stat-card">
    <span class="stat-label">Total Invested</span>
    <span class="stat-value">${{ total_invested | round }}</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Income</span>
    <span class="stat-value positive">${{ total_income | round }}</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Expenses</span>
    <span class="stat-value negative">${{ total_expenses | round }}</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Realized Gains</span>
    {% assign total_realized_num = total_realized | plus: 0 %}
    <span class="stat-value {% if total_realized_num >= 0 %}positive{% else %}negative{% endif %}">
      {% if total_realized_num >= 0 %}+{% endif %}${{ total_realized | round }}
    </span>
  </div>
</div>

<!-- Data for JavaScript -->
<script type="application/json" id="holdings-data">
[{% for holding in site.data.holdings %}
  {
    "id": "{{ holding.id }}",
    "name": "{{ holding.name }}",
    "category": "{{ holding.category }}",
    "date_acquired": "{{ holding.date_acquired }}",
    "cost_basis": {{ holding.cost_basis }},
    "current_value": {{ holding.current_value }},
    "quantity": {{ holding.quantity }},
    "notes": "{{ holding.notes | escape }}"
  }{% unless forloop.last %},{% endunless %}
{% endfor %}]
</script>

<script type="application/json" id="transactions-data">
[{% for tx in site.data.transactions %}
  {
    "id": "{{ tx.id }}",
    "date": "{{ tx.date }}",
    "type": "{{ tx.type }}",
    "amount": {{ tx.amount }},
    "description": "{{ tx.description | escape }}"
  }{% unless forloop.last %},{% endunless %}
{% endfor %}]
</script>

<script type="application/json" id="sales-data">
[{% for sale in site.data.sales %}
  {
    "id": "{{ sale.id }}",
    "holding_id": "{{ sale.holding_id }}",
    "date_sold": "{{ sale.date_sold }}",
    "quantity_sold": {{ sale.quantity_sold }},
    "sale_proceeds": {{ sale.sale_proceeds }},
    "cost_basis_sold": {{ sale.cost_basis_sold }},
    "notes": "{{ sale.notes | escape }}"
  }{% unless forloop.last %},{% endunless %}
{% endfor %}]
</script>
