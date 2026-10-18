/**
 * menu.js - Menu filtering, dynamic rendering, and interactive catering tray estimator
 * Radha Catering | Pure Vegetarian
 */

let activeCategory = 'all';
let partyCart = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof loadGlobalMenuData === 'function') {
    await loadGlobalMenuData();
  }
  
  initMenuFilters();
  renderMenuItems();
  initEstimator();
});

/**
 * Initialize category filter buttons
 */
function initMenuFilters() {
  const filterContainer = document.getElementById('category-filters');
  if (!filterContainer) return;

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;

    filterContainer.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategory = btn.getAttribute('data-category');
    renderMenuItems();
  });

  // Search input support if present
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderMenuItems(searchInput.value.trim().toLowerCase());
    });
  }
}

/**
 * Render items in grid
 */
function renderMenuItems(searchQuery = '') {
  const container = document.getElementById('menu-items-grid');
  if (!container) return;

  const items = window.RadhaData.items || [];
  let filtered = items;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory);
  }

  if (searchQuery) {
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      (item.description && item.description.toLowerCase().includes(searchQuery))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px solid #e9ecef;">
        <i class="fa-solid fa-bowl-food" style="font-size: 2.5rem; color: #c25e00; margin-bottom: 1rem;"></i>
        <h3>No menu items found</h3>
        <p style="color: #6c757d;">Try selecting another category or clear your search term.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => createDishCardHTML(item)).join('');

  // Attach "+ Add to Estimator" events
  container.querySelectorAll('.js-add-tray').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = parseInt(btn.getAttribute('data-id'), 10);
      const size = btn.getAttribute('data-size');
      addToEstimator(itemId, size);
    });
  });
}

/**
 * Creates HTML template for a single dish card
 */
function createDishCardHTML(item) {
  const categoryNames = {
    starters: 'Appetizers & Starters',
    curries: 'Main Course Curries',
    rice: 'Biryani & Rice',
    breads: 'Breads & Sides',
    desserts: 'Desserts & Sweets',
    packages: 'Party Combo'
  };

  const catName = categoryNames[item.category] || item.category;

  return `
    <article class="dish-card" id="dish-${item.id}">
      <div class="dish-img-wrapper">
        <img class="dish-img" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80'" />
        <div class="dish-badges">
          ${item.badge ? `<span class="dish-badge highlight">${item.badge}</span>` : ''}
          ${item.isJainAvailable ? `<span class="dish-badge">Jain Option</span>` : ''}
        </div>
        <div class="veg-icon-badge" title="100% Pure Vegetarian"></div>
      </div>
      <div class="dish-body">
        <div class="dish-category">${catName}</div>
        <h3 class="dish-title">${item.title}</h3>
        <p class="dish-desc">${item.description}</p>
        
        <div class="dish-pricing-box">
          <div class="price-col">
            <span class="price-label">Half Tray</span>
            <div class="price-amount">$${item.halfTrayPrice}</div>
            <span class="price-serves">${item.halfTrayServes || '10-12 guests'}</span>
          </div>
          <div class="price-col">
            <span class="price-label">Full Tray</span>
            <div class="price-amount">$${item.fullTrayPrice}</div>
            <span class="price-serves">${item.fullTrayServes || '20-25 guests'}</span>
          </div>
        </div>

        <div class="dish-actions">
          <button type="button" class="btn btn-outline btn-sm js-add-tray" data-id="${item.id}" data-size="half" style="flex: 1;">
            <i class="fa-solid fa-plus"></i> Half Tray
          </button>
          <button type="button" class="btn btn-primary btn-sm js-add-tray" data-id="${item.id}" data-size="full" style="flex: 1;">
            <i class="fa-solid fa-plus"></i> Full Tray
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Interactive Catering Estimator
 */
function initEstimator() {
  updateEstimatorUI();

  const resetBtn = document.getElementById('reset-estimator-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      partyCart = [];
      updateEstimatorUI();
      if (window.showToast) window.showToast('Estimator cleared', 'info');
    });
  }

  const whatsappOrderBtn = document.getElementById('whatsapp-estimator-btn');
  if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', () => {
      sendEstimatorViaWhatsApp();
    });
  }
}

function addToEstimator(itemId, size) {
  const item = (window.RadhaData.items || []).find(i => i.id === itemId);
  if (!item) return;

  const price = size === 'half' ? item.halfTrayPrice : item.fullTrayPrice;
  const serves = size === 'half' ? (item.halfTrayServes || '10-12 guests') : (item.fullTrayServes || '20-25 guests');
  const sizeLabel = size === 'half' ? 'Half Tray' : 'Full Tray';

  // Check if already in cart
  const existing = partyCart.find(c => c.itemId === itemId && c.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    partyCart.push({
      itemId: item.id,
      title: item.title,
      size: size,
      sizeLabel: sizeLabel,
      price: price,
      serves: serves,
      qty: 1
    });
  }

  updateEstimatorUI();
  if (window.showToast) {
    window.showToast(`Added ${sizeLabel} of ${item.title} to Estimator!`);
  }
}

function updateEstimatorUI() {
  const listEl = document.getElementById('estimator-cart-list');
  const totalAmountEl = document.getElementById('estimator-total-price');
  const totalItemsEl = document.getElementById('estimator-item-count');
  const emptyNotice = document.getElementById('estimator-empty-msg');
  const summaryBox = document.getElementById('estimator-summary-box');

  if (!listEl) return;

  if (partyCart.length === 0) {
    listEl.innerHTML = '';
    if (emptyNotice) emptyNotice.style.display = 'block';
    if (summaryBox) summaryBox.style.display = 'none';
    if (totalAmountEl) totalAmountEl.textContent = '$0';
    if (totalItemsEl) totalItemsEl.textContent = '0 items';
    return;
  }

  if (emptyNotice) emptyNotice.style.display = 'none';
  if (summaryBox) summaryBox.style.display = 'flex';

  let totalCost = 0;
  let totalTrays = 0;

  listEl.innerHTML = partyCart.map((entry, index) => {
    const itemTotal = entry.price * entry.qty;
    totalCost += itemTotal;
    totalTrays += entry.qty;

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e9ecef;">
        <div>
          <strong style="color: #212529;">${entry.title}</strong>
          <span style="display: block; font-size: 0.8rem; color: #c25e00; font-weight: 600;">${entry.sizeLabel} ($${entry.price} each)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button type="button" onclick="changeEstimatorQty(${index}, -1)" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid #ced4da; background: #fff; cursor: pointer;">-</button>
          <span style="font-weight: 700; min-width: 20px; text-align: center;">${entry.qty}</span>
          <button type="button" onclick="changeEstimatorQty(${index}, 1)" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid #ced4da; background: #fff; cursor: pointer;">+</button>
          <span style="font-weight: 700; min-width: 60px; text-align: right; color: #166534;">$${itemTotal}</span>
          <button type="button" onclick="removeEstimatorItem(${index})" style="background: none; border: none; color: #dc3545; cursor: pointer; padding: 0 4px;" title="Remove"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');

  if (totalAmountEl) totalAmountEl.textContent = `$${totalCost}`;
  if (totalItemsEl) totalItemsEl.textContent = `${totalTrays} tray${totalTrays > 1 ? 's' : ''}`;
}

window.changeEstimatorQty = function(index, delta) {
  if (!partyCart[index]) return;
  partyCart[index].qty += delta;
  if (partyCart[index].qty <= 0) {
    partyCart.splice(index, 1);
  }
  updateEstimatorUI();
};

window.removeEstimatorItem = function(index) {
  partyCart.splice(index, 1);
  updateEstimatorUI();
};

function sendEstimatorViaWhatsApp() {
  if (partyCart.length === 0) {
    alert('Please add at least one catering tray to calculate your estimate.');
    return;
  }

  const info = window.RadhaData.businessInfo || {};
  const whatsappNum = info.whatsapp || '19786526164';

  let msg = `*New Catering Inquiry - Radha Catering*\n`;
  msg += `*Location:* ${info.cityState || 'Powell, OH'}\n`;
  msg += `--------------------------------------\n`;
  msg += `*Selected Trays & Estimate:*\n`;

  let totalCost = 0;
  partyCart.forEach(item => {
    const sub = item.price * item.qty;
    totalCost += sub;
    msg += `• ${item.qty}x ${item.title} (${item.sizeLabel}) - $${sub}\n`;
  });

  msg += `--------------------------------------\n`;
  msg += `*Estimated Total:* $${totalCost}\n\n`;
  msg += `Hello Radha, I would like to check availability and order the above vegetarian trays for my event. Please let me know the next steps!`;

  window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
}
