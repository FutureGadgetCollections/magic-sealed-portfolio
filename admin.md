---
layout: default
title: Admin
description: Manage your sealed portfolio data
---

<header class="page-header">
  <h1 class="page-title">Admin</h1>
  <p class="page-description">Manage your Pokemon sealed portfolio data and view instructions</p>
</header>

<div class="stats-grid">
  <a href="{{ site.sheets.editable }}" target="_blank" class="stat-card admin-link">
    <span class="stat-label">Edit</span>
    <span class="stat-value" style="font-size: 1.25rem;">Google Sheet</span>
    <small style="color: var(--color-gray-500);">Open editable spreadsheet</small>
  </a>
  <a href="{{ site.sheets.published }}" target="_blank" class="stat-card admin-link">
    <span class="stat-label">View Only</span>
    <span class="stat-value" style="font-size: 1.25rem;">Published Sheet</span>
    <small style="color: var(--color-gray-500);">Share this link with others</small>
  </a>
</div>

<div class="card" style="margin-bottom: 1.5rem;">
  <h2 class="card-title">Adding a New Product</h2>
  <p style="color: var(--color-gray-600); margin-bottom: 1rem;">When you buy a new sealed product, update <strong>2 sheets</strong>:</p>

  <div class="admin-section">
    <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">1. Holdings Sheet</h3>
    <p style="color: var(--color-gray-600); font-size: 0.875rem;">Add a new row with:</p>
    <ul style="color: var(--color-gray-600); font-size: 0.875rem; margin-left: 1.5rem;">
      <li><strong>ID</strong> - Unique identifier e.g. <code>SV1-BOX</code></li>
      <li><strong>NAME</strong> - Product name e.g. <code>SV01 Booster Box</code></li>
      <li><strong>SET</strong> - Pokemon set e.g. <code>SV Base</code></li>
      <li><strong>LOCATION</strong> - Where the product is stored e.g. <code>Basement</code></li>
      <li><strong>QUANTITY</strong> - Number of units e.g. <code>14</code></li>
      <li><strong>AVERAGE UNIT COST</strong> - Price paid per unit e.g. <code>$178.00</code></li>
      <li><strong>TOTAL COST BASIS</strong> - Total amount spent (quantity &times; avg unit cost)</li>
      <li><strong>CURRENT UNIT VALUE</strong> - Current market value per unit e.g. <code>$270.00</code></li>
      <li><strong>TOTAL CURRENT VALUE</strong> - Total current value (quantity &times; current unit value)</li>
      <li><strong>LAST CHECKED DATE</strong> - When you last updated the current value</li>
      <li><strong>STATUS</strong> - Set to <code>OPEN</code></li>
      <li><strong>NOTES</strong> - Any relevant notes e.g. expiry date</li>
    </ul>
  </div>

  <div class="admin-section" style="margin-top: 1rem;">
    <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">2. Transactions Sheet</h3>
    <p style="color: var(--color-gray-600); font-size: 0.875rem;">Add a <strong>Deposit</strong> entry:</p>
    <ul style="color: var(--color-gray-600); font-size: 0.875rem; margin-left: 1.5rem;">
      <li><strong>Date</strong> - Date of purchase (MM/DD/YYYY)</li>
      <li><strong>Deposit/Withdrawal</strong> - Negative number (money going out) e.g. <code>-$2,500</code></li>
      <li><strong>Transaction Type</strong> - <code>Deposit</code></li>
      <li><strong>Notes</strong> - Description of the purchase</li>
    </ul>
  </div>
</div>

<div class="card" style="margin-bottom: 1.5rem;">
  <h2 class="card-title">Selling a Product</h2>
  <p style="color: var(--color-gray-600); margin-bottom: 1rem;">When you sell a sealed product, update <strong>3 sheets</strong>:</p>

  <div class="admin-section">
    <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">1. Holdings Sheet</h3>
    <p style="color: var(--color-gray-600); font-size: 0.875rem;">Find the product row and change:</p>
    <ul style="color: var(--color-gray-600); font-size: 0.875rem; margin-left: 1.5rem;">
      <li><strong>STATUS</strong> - Change from <code>OPEN</code> to <code>CLOSED</code></li>
      <li><strong>QUANTITY</strong> - Update if partially sold</li>
      <li><strong>LAST CHECKED DATE</strong> - Update to sale date</li>
    </ul>
  </div>

  <div class="admin-section" style="margin-top: 1rem;">
    <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">2. Sales Sheet</h3>
    <p style="color: var(--color-gray-600); font-size: 0.875rem;">Add a new row with:</p>
    <ul style="color: var(--color-gray-600); font-size: 0.875rem; margin-left: 1.5rem;">
      <li><strong>ID</strong> - Identifier for this sale e.g. <code>SV1-BOX-SALE-1</code></li>
      <li><strong>NAME</strong> - Product name e.g. <code>SV01 Booster Box</code></li>
      <li><strong>DATE</strong> - Date of sale (MM/DD/YYYY)</li>
      <li><strong>COST BASIS</strong> - Original purchase price</li>
      <li><strong>SALE PRICE</strong> - Amount received from sale</li>
      <li><strong>NOTES</strong> - Any relevant notes</li>
    </ul>
  </div>

  <div class="admin-section" style="margin-top: 1rem;">
    <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">3. Transactions Sheet</h3>
    <p style="color: var(--color-gray-600); font-size: 0.875rem;">Add a <strong>Withdrawal</strong> entry:</p>
    <ul style="color: var(--color-gray-600); font-size: 0.875rem; margin-left: 1.5rem;">
      <li><strong>Date</strong> - Date of sale (MM/DD/YYYY)</li>
      <li><strong>Deposit/Withdrawal</strong> - Positive number (money coming in) e.g. <code>$2,600</code></li>
      <li><strong>Transaction Type</strong> - <code>Withdrawal</code></li>
      <li><strong>Notes</strong> - Description of the sale</li>
    </ul>
  </div>
</div>

<div class="card">
  <h2 class="card-title">Why All Three Updates Matter</h2>
  <div style="color: var(--color-gray-600); line-height: 1.7;">
    <ul style="margin-left: 1.5rem;">
      <li><strong>Holdings</strong> - Tracks what sealed products you own/owned and maintains historical record</li>
      <li><strong>Sales</strong> - Calculates realized gains (sale_price - cost_basis)</li>
      <li><strong>Transactions</strong> - Powers IRR calculation (tracks all cash flowing in and out)</li>
    </ul>
    <p style="margin-top: 1rem;">
      <strong>Important:</strong> If you skip the Withdrawal transaction when selling, your IRR will be incorrect
      because it won't know money came back to you.
    </p>
  </div>
</div>
