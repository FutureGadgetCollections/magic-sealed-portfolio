---
layout: default
title: Holdings
description: Complete list of portfolio holdings
---

<header class="page-header">
  <h1 class="page-title">Holdings</h1>
  <p class="page-description">All portfolio items with current values and performance</p>
</header>

<div class="holdings-controls">
  <input type="text" id="holdings-search" class="search-input" placeholder="Search holdings...">

  <div class="filter-buttons">
    <button class="filter-btn active" data-category="all">All</button>
    {% assign categories = site.data.holdings | map: "category" | uniq | sort %}
    {% for category in categories %}
    <button class="filter-btn" data-category="{{ category }}">{{ category }}</button>
    {% endfor %}
  </div>
</div>

<div class="table-container">
  <table class="holdings-table">
    <thead>
      <tr>
        <th data-sort="name">Name</th>
        <th data-sort="category">Category</th>
        <th data-sort="cost">Cost Basis</th>
        <th data-sort="value">Current Value</th>
        <th data-sort="gain">Gain/Loss</th>
        <th data-sort="gainpct">Gain %</th>
        <th data-sort="date">Date Acquired</th>
      </tr>
    </thead>
    <tbody>
      {% for holding in site.data.holdings %}
      {% assign gain_loss = holding.current_value | minus: holding.cost_basis %}
      {% assign gain_loss_pct = gain_loss | times: 100.0 | divided_by: holding.cost_basis %}
      <tr data-category="{{ holding.category }}"
          data-name="{{ holding.name }}"
          data-cost="{{ holding.cost_basis }}"
          data-value="{{ holding.current_value }}"
          data-gain="{{ gain_loss }}"
          data-gainpct="{{ gain_loss_pct }}"
          data-date="{{ holding.date_acquired }}"
          data-notes="{{ holding.notes }}">
        <td class="name-cell">{{ holding.name }}</td>
        <td><span class="category-badge">{{ holding.category }}</span></td>
        <td class="value-cell">${{ holding.cost_basis | round }}</td>
        <td class="value-cell">${{ holding.current_value | round }}</td>
        <td class="value-cell {% if gain_loss >= 0 %}positive{% else %}negative{% endif %}">
          {% if gain_loss >= 0 %}+{% endif %}${{ gain_loss | round }}
        </td>
        <td class="value-cell {% if gain_loss_pct >= 0 %}positive{% else %}negative{% endif %}">
          {% if gain_loss_pct >= 0 %}+{% endif %}{{ gain_loss_pct | round: 1 }}%
        </td>
        <td>{{ holding.date_acquired }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>

<!-- Summary -->
<div class="stats-grid" style="margin-top: 2rem;">
  {% assign total_cost = 0 %}
  {% assign total_value = 0 %}
  {% for holding in site.data.holdings %}
    {% assign total_cost = total_cost | plus: holding.cost_basis %}
    {% assign total_value = total_value | plus: holding.current_value %}
  {% endfor %}
  {% assign total_gain = total_value | minus: total_cost %}
  {% assign total_gain_pct = total_gain | times: 100.0 | divided_by: total_cost %}

  <div class="stat-card">
    <span class="stat-label">Total Holdings</span>
    <span class="stat-value">{{ site.data.holdings | size }}</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Cost</span>
    <span class="stat-value">${{ total_cost | round }}</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Value</span>
    <span class="stat-value">${{ total_value | round }}</span>
  </div>

  <div class="stat-card">
    <span class="stat-label">Total Gain/Loss</span>
    <span class="stat-value {% if total_gain >= 0 %}positive{% else %}negative{% endif %}">
      {% if total_gain >= 0 %}+{% endif %}${{ total_gain | round }}
      <small>({% if total_gain_pct >= 0 %}+{% endif %}{{ total_gain_pct | round: 1 }}%)</small>
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
