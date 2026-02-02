---
layout: default
title: Dashboard
---

<div class="stats-grid">
  <div class="stat-card">
    <span class="stat-label">Total Portfolio Value</span>
    <span class="stat-value" id="total-value">Loading...</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Cost Basis</span>
    <span class="stat-value" id="total-cost">Loading...</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Unrealized Gain/Loss</span>
    <span class="stat-value" id="total-gain">Loading...</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Portfolio IRR</span>
    <span class="stat-value" id="portfolio-irr">Loading...</span>
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
    <h2 class="card-title">Top Gainers</h2>
    <div id="top-gainers" class="loading">Loading...</div>
  </div>

  <div class="card">
    <h2 class="card-title">Smallest Gains</h2>
    <div id="top-losers" class="loading">Loading...</div>
  </div>
</div>

<div class="card">
  <h2 class="card-title">Category Breakdown</h2>
  <div id="category-breakdown" class="loading">Loading...</div>
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
