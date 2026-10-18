/**
 * admin.js - Admin Portal Logic for Radha Catering
 * Allows updating item names, half/full tray prices, categories, uploading pictures,
 * managing home page scrolling slider photos, and saving to server/Hostinger.
 */

const ADMIN_PASSCODE = 'RadhaAdmin2024';
let currentAdminData = null;
let editingItemId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminData();
  initAuth();
  setupEventListeners();
  renderAdminUI();
});

/**
 * Authentication handling
 */
function initAuth() {
  const isAuth = sessionStorage.getItem('radha_admin_logged') === 'true';
  const loginSection = document.getElementById('admin-login-view');
  const dashSection = document.getElementById('admin-dashboard-view');
  const loginForm = document.getElementById('admin-login-form');

  if (isAuth) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashSection) dashSection.style.display = 'block';
  } else {
    if (loginSection) loginSection.style.display = 'block';
    if (dashSection) dashSection.style.display = 'none';
  }

  // Eye toggle for login password field
  const toggleLoginBtn = document.getElementById('toggle-login-password');
  const loginPassInput = document.getElementById('admin-password');
  const loginEyeIcon = document.getElementById('login-eye-icon');
  if (toggleLoginBtn && loginPassInput && loginEyeIcon) {
    toggleLoginBtn.addEventListener('click', () => {
      if (loginPassInput.type === 'password') {
        loginPassInput.type = 'text';
        loginEyeIcon.classList.remove('fa-eye');
        loginEyeIcon.classList.add('fa-eye-slash');
      } else {
        loginPassInput.type = 'password';
        loginEyeIcon.classList.remove('fa-eye-slash');
        loginEyeIcon.classList.add('fa-eye');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = document.getElementById('admin-password').value.trim();
      const serverPass = currentAdminData && currentAdminData.adminPasscode;
      const storedPass = serverPass || localStorage.getItem('radha_admin_pass') || ADMIN_PASSCODE;

      if (enteredPass === storedPass) {
        sessionStorage.setItem('radha_admin_logged', 'true');
        loginSection.style.display = 'none';
        dashSection.style.display = 'block';
        if (window.showToast) window.showToast('Welcome back, Radha Admin!', 'success');
        renderAdminUI();
      } else {
        alert('Incorrect Passcode. Please check and try again.');
      }
    });
  }

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('radha_admin_logged');
      window.location.reload();
    });
  }
}

/**
 * Loads menu data for admin editing
 */
async function loadAdminData() {
  try {
    let res;
    try {
      res = await fetch('api/menu.php?t=' + Date.now());
      if (!res.ok) throw new Error('API response not ok');
    } catch (e) {
      res = await fetch('data/menu.json?t=' + Date.now());
    }

    if (res && res.ok) {
      currentAdminData = await res.json();
    } else {
      const local = localStorage.getItem('radha_menu_data');
      if (local) currentAdminData = JSON.parse(local);
    }
  } catch (err) {
    const local = localStorage.getItem('radha_menu_data');
    if (local) currentAdminData = JSON.parse(local);
  }

  if (!currentAdminData) {
    console.error('Could not initialize admin data');
  }
}

/**
 * Setup tab switching, modal controls, and global buttons
 */
function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const target = document.getElementById(tabId);
      if (target) target.style.display = 'block';
    });
  });

  // Save to Server Button
  const saveBtn = document.getElementById('save-all-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveChangesToServer);
  }

  // Download Backup JSON Button
  const backupBtn = document.getElementById('download-backup-btn');
  if (backupBtn) {
    backupBtn.addEventListener('click', downloadBackupJSON);
  }

  // Add Item Button
  const addItemBtn = document.getElementById('add-item-modal-btn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', openAddItemModal);
  }

  // Add Slider Photo Button
  const addSliderBtn = document.getElementById('add-slider-modal-btn');
  if (addSliderBtn) {
    addSliderBtn.addEventListener('click', openAddSliderModal);
  }

  // File Upload Handlers (Menu Item Modal)
  const itemFileInput = document.getElementById('item-image-file');
  if (itemFileInput) {
    itemFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await handleImageUpload(file, 'item-image-preview', 'item-image-url');
      }
    });
  }

  // File Upload Handlers (Slider Photo Modal)
  const sliderFileInput = document.getElementById('slider-image-file');
  if (sliderFileInput) {
    sliderFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await handleImageUpload(file, 'slider-image-preview', 'slider-image-url');
      }
    });
  }

  // Item Form Submit
  const itemForm = document.getElementById('item-modal-form');
  if (itemForm) {
    itemForm.addEventListener('submit', handleSaveItemForm);
  }

  // Slider Form Submit
  const sliderForm = document.getElementById('slider-modal-form');
  if (sliderForm) {
    sliderForm.addEventListener('submit', handleSaveSliderForm);
  }

  // Business Info Form Submit
  const infoForm = document.getElementById('business-info-form');
  if (infoForm) {
    infoForm.addEventListener('submit', handleSaveBusinessInfo);
  }

  // Toggle New Password Visibility
  const toggleNewBtn = document.getElementById('toggle-new-password');
  const newPassInput = document.getElementById('new-admin-password');
  const newEyeIcon = document.getElementById('new-pass-eye-icon');
  if (toggleNewBtn && newPassInput && newEyeIcon) {
    toggleNewBtn.addEventListener('click', () => {
      if (newPassInput.type === 'password') {
        newPassInput.type = 'text';
        newEyeIcon.classList.remove('fa-eye');
        newEyeIcon.classList.add('fa-eye-slash');
      } else {
        newPassInput.type = 'password';
        newEyeIcon.classList.remove('fa-eye-slash');
        newEyeIcon.classList.add('fa-eye');
      }
    });
  }

  // Change Password Form Submit
  const changePassForm = document.getElementById('change-password-form');
  if (changePassForm) {
    changePassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('new-admin-password').value.trim();
      const confirmPass = document.getElementById('confirm-admin-password').value.trim();

      if (!newPass) {
        alert('Please enter a new passcode.');
        return;
      }
      if (newPass.length < 4) {
        alert('Passcode should be at least 4 characters.');
        return;
      }
      if (newPass !== confirmPass) {
        alert('Passcodes do not match. Please re-enter.');
        return;
      }

      localStorage.setItem('radha_admin_pass', newPass);
      if (currentAdminData) {
        currentAdminData.adminPasscode = newPass;
        saveChangesLocally();
      }
      changePassForm.reset();
      if (window.showToast) {
        window.showToast('Passcode updated! Remember to click "Save All Changes" to save to server.');
      } else {
        alert('Passcode updated! Click "Save All Changes" to save to server.');
      }
    });
  }

  // Item Search in Admin
  const searchInput = document.getElementById('admin-item-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderItemsTable(searchInput.value.trim().toLowerCase());
    });
  }
}

/**
 * Render all Admin sections
 */
function renderAdminUI() {
  if (!currentAdminData) return;

  renderStats();
  renderItemsTable();
  renderSliderPhotosTable();
  populateBusinessInfoForm();
}

function renderStats() {
  const items = currentAdminData.items || [];
  const slides = currentAdminData.sliderPhotos || [];

  const totalItemsEl = document.getElementById('stat-total-items');
  const totalSlidesEl = document.getElementById('stat-total-slides');
  const avgHalfPriceEl = document.getElementById('stat-avg-half');

  if (totalItemsEl) totalItemsEl.textContent = items.length;
  if (totalSlidesEl) totalSlidesEl.textContent = slides.length;

  if (avgHalfPriceEl && items.length > 0) {
    const totalHalf = items.reduce((sum, item) => sum + (Number(item.halfTrayPrice) || 0), 0);
    avgHalfPriceEl.textContent = '$' + Math.round(totalHalf / items.length);
  }
}

/**
 * Render Menu Items List for Editing
 */
function renderItemsTable(search = '') {
  const tableBody = document.getElementById('admin-items-table-body');
  if (!tableBody) return;

  let items = currentAdminData.items || [];
  if (search) {
    items = items.filter(i => 
      i.title.toLowerCase().includes(search) || 
      i.category.toLowerCase().includes(search)
    );
  }

  if (items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #6c757d;">No items found. Click "+ Add New Dish" above.</td></tr>`;
    return;
  }

  tableBody.innerHTML = items.map(item => `
    <tr>
      <td style="width: 70px;">
        <img src="${item.image}" alt="" style="width: 54px; height: 54px; object-fit: cover; border-radius: 6px; border: 1px solid #dee2e6;" onerror="this.src='https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=150&q=80'" />
      </td>
      <td>
        <strong>${item.title}</strong>
        ${item.badge ? `<span style="display: inline-block; font-size: 0.7rem; background: #c25e00; color: #fff; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">${item.badge}</span>` : ''}
        <div style="font-size: 0.78rem; color: #6c757d; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.description || ''}</div>
      </td>
      <td>
        <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #e8f5e9; color: #166534; text-transform: capitalize;">
          ${item.category}
        </span>
      </td>
      <td style="font-weight: 700; color: #c25e00;">$${item.halfTrayPrice}</td>
      <td style="font-weight: 700; color: #166534;">$${item.fullTrayPrice}</td>
      <td>
        <span style="font-size: 0.8rem; font-weight: 600; color: ${item.available !== false ? '#166534' : '#dc3545'};">
          <i class="fa-solid fa-circle" style="font-size: 0.5rem; vertical-align: middle;"></i> ${item.available !== false ? 'Active' : 'Hidden'}
        </span>
      </td>
      <td style="text-align: right;">
        <button type="button" class="btn btn-outline btn-sm" onclick="openEditItemModal(${item.id})" style="padding: 4px 10px; margin-right: 4px;">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button type="button" class="btn btn-sm" onclick="deleteMenuItem(${item.id})" style="background: #fee2e2; color: #dc2626; border: none; padding: 4px 10px;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Render Homepage Scrolling Photos Table
 */
function renderSliderPhotosTable() {
  const container = document.getElementById('admin-slider-table-body');
  if (!container) return;

  const slides = currentAdminData.sliderPhotos || [];

  if (slides.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6c757d;">No photos in homepage carousel. Add one below.</td></tr>`;
    return;
  }

  container.innerHTML = slides.map((slide, index) => `
    <tr>
      <td style="width: 80px;">
        <img src="${slide.image}" alt="" style="width: 70px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #dee2e6;" onerror="this.src='https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=150&q=80'" />
      </td>
      <td>
        <strong>${slide.title}</strong>
        <div style="font-size: 0.8rem; color: #6c757d;">${slide.tagline || ''}</div>
      </td>
      <td>
        <span style="font-size: 0.8rem; background: #f8f9fa; padding: 3px 8px; border-radius: 4px; border: 1px solid #e9ecef;">
          ${slide.category || 'Featured'}
        </span>
      </td>
      <td style="font-size: 0.8rem; color: #6c757d;">${slide.link || 'menu.html'}</td>
      <td style="text-align: right;">
        <button type="button" class="btn btn-sm" onclick="deleteSliderPhoto(${index})" style="background: #fee2e2; color: #dc2626; border: none; padding: 4px 10px;">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Handle Image File Upload (to Hostinger PHP or local Python server)
 */
async function handleImageUpload(file, previewImgId, urlInputId) {
  const statusEl = document.getElementById('upload-status-indicator');
  if (statusEl) statusEl.textContent = 'Uploading picture...';

  const preview = document.getElementById(previewImgId);
  const urlInput = document.getElementById(urlInputId);

  // Local instant preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);

  // Upload to API
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('api/upload.php', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.success && data.url) {
      if (urlInput) urlInput.value = data.url;
      if (statusEl) statusEl.textContent = 'Uploaded successfully!';
      if (window.showToast) window.showToast('Photo uploaded successfully to server!');
    } else {
      throw new Error(data.error || 'Server rejected file upload');
    }
  } catch (err) {
    console.warn('Backend upload not available or errored:', err);
    // Fallback: If running without backend, use the base64 or keep local preview
    if (statusEl) statusEl.textContent = 'Using image preview for changes.';
    if (urlInput && !urlInput.value) {
      urlInput.value = preview ? preview.src : '';
    }
  }
}

/**
 * Modals: Open Add / Edit Item
 */
window.openAddItemModal = function() {
  editingItemId = null;
  document.getElementById('item-modal-title').textContent = 'Add New Vegetarian Dish';
  document.getElementById('item-modal-form').reset();
  document.getElementById('item-image-preview').style.display = 'none';
  document.getElementById('item-modal-backdrop').style.display = 'flex';
};

window.openEditItemModal = function(id) {
  const item = (currentAdminData.items || []).find(i => i.id === id);
  if (!item) return;

  editingItemId = id;
  document.getElementById('item-modal-title').textContent = 'Edit Dish Details & Prices';
  
  document.getElementById('item-title').value = item.title || '';
  document.getElementById('item-category').value = item.category || 'curries';
  document.getElementById('item-desc').value = item.description || '';
  document.getElementById('item-half-price').value = item.halfTrayPrice || '';
  document.getElementById('item-full-price').value = item.fullTrayPrice || '';
  document.getElementById('item-half-serves').value = item.halfTrayServes || '10-12 guests';
  document.getElementById('item-full-serves').value = item.fullTrayServes || '20-25 guests';
  document.getElementById('item-badge').value = item.badge || '';
  document.getElementById('item-image-url').value = item.image || '';
  document.getElementById('item-jain').checked = !!item.isJainAvailable;
  document.getElementById('item-available').checked = item.available !== false;

  const preview = document.getElementById('item-image-preview');
  if (item.image) {
    preview.src = item.image;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }

  document.getElementById('item-modal-backdrop').style.display = 'flex';
};

window.closeItemModal = function() {
  document.getElementById('item-modal-backdrop').style.display = 'none';
};

function handleSaveItemForm(e) {
  e.preventDefault();

  const title = document.getElementById('item-title').value.trim();
  const category = document.getElementById('item-category').value;
  const description = document.getElementById('item-desc').value.trim();
  const halfTrayPrice = Number(document.getElementById('item-half-price').value) || 0;
  const fullTrayPrice = Number(document.getElementById('item-full-price').value) || 0;
  const halfTrayServes = document.getElementById('item-half-serves').value.trim() || '10-12 guests';
  const fullTrayServes = document.getElementById('item-full-serves').value.trim() || '20-25 guests';
  const badge = document.getElementById('item-badge').value.trim();
  const imageUrl = document.getElementById('item-image-url').value.trim() || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
  const isJainAvailable = document.getElementById('item-jain').checked;
  const available = document.getElementById('item-available').checked;

  if (!title) {
    alert('Please enter a dish title.');
    return;
  }

  if (editingItemId) {
    // Update existing
    const item = currentAdminData.items.find(i => i.id === editingItemId);
    if (item) {
      item.title = title;
      item.category = category;
      item.description = description;
      item.halfTrayPrice = halfTrayPrice;
      item.fullTrayPrice = fullTrayPrice;
      item.halfTrayServes = halfTrayServes;
      item.fullTrayServes = fullTrayServes;
      item.badge = badge;
      item.image = imageUrl;
      item.isJainAvailable = isJainAvailable;
      item.available = available;
    }
  } else {
    // Generate new ID
    const newId = currentAdminData.items.reduce((max, i) => Math.max(max, i.id || 0), 0) + 1;
    currentAdminData.items.push({
      id: newId,
      title,
      category,
      description,
      halfTrayPrice,
      fullTrayPrice,
      halfTrayServes,
      fullTrayServes,
      badge,
      image: imageUrl,
      isPureVeg: true,
      isJainAvailable,
      available
    });
  }

  closeItemModal();
  renderAdminUI();
  saveChangesLocally();
  if (window.showToast) window.showToast('Item saved! Remember to click "Save All Changes to Server".');
}

window.deleteMenuItem = function(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;
  currentAdminData.items = currentAdminData.items.filter(i => i.id !== id);
  renderAdminUI();
  saveChangesLocally();
  if (window.showToast) window.showToast('Item deleted.');
};

/**
 * Modals: Open Add Slider Photo
 */
window.openAddSliderModal = function() {
  document.getElementById('slider-modal-form').reset();
  document.getElementById('slider-image-preview').style.display = 'none';
  document.getElementById('slider-modal-backdrop').style.display = 'flex';
};

window.closeSliderModal = function() {
  document.getElementById('slider-modal-backdrop').style.display = 'none';
};

function handleSaveSliderForm(e) {
  e.preventDefault();

  const title = document.getElementById('slider-title').value.trim();
  const tagline = document.getElementById('slider-tagline').value.trim();
  const category = document.getElementById('slider-category').value.trim() || 'Radha Special';
  const link = document.getElementById('slider-link').value.trim() || 'menu.html';
  const image = document.getElementById('slider-image-url').value.trim();

  if (!title || !image) {
    alert('Please enter a title and select/upload an image.');
    return;
  }

  if (!currentAdminData.sliderPhotos) currentAdminData.sliderPhotos = [];

  currentAdminData.sliderPhotos.push({
    id: 'slide-' + Date.now(),
    title,
    tagline,
    category,
    image,
    link
  });

  closeSliderModal();
  renderAdminUI();
  saveChangesLocally();
  if (window.showToast) window.showToast('New photo added to homepage carousel!');
}

window.deleteSliderPhoto = function(index) {
  if (!confirm('Remove this photo from the homepage carousel?')) return;
  currentAdminData.sliderPhotos.splice(index, 1);
  renderAdminUI();
  saveChangesLocally();
  if (window.showToast) window.showToast('Slider photo removed.');
};

/**
 * Business Info Form
 */
function populateBusinessInfoForm() {
  const info = currentAdminData.businessInfo || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('info-name', info.name);
  setVal('info-phone', info.phone);
  setVal('info-whatsapp', info.whatsapp);
  setVal('info-email', info.email);
  setVal('info-citystate', info.cityState);
  setVal('info-serviceareas', info.serviceAreas);
  setVal('info-noticetext', info.noticeText);
  setVal('info-announcement', info.announcement);
}

function handleSaveBusinessInfo(e) {
  e.preventDefault();

  if (!currentAdminData.businessInfo) currentAdminData.businessInfo = {};
  const info = currentAdminData.businessInfo;

  info.name = document.getElementById('info-name').value.trim();
  info.phone = document.getElementById('info-phone').value.trim();
  info.whatsapp = document.getElementById('info-whatsapp').value.trim();
  info.email = document.getElementById('info-email').value.trim();
  info.cityState = document.getElementById('info-citystate').value.trim();
  info.serviceAreas = document.getElementById('info-serviceareas').value.trim();
  info.noticeText = document.getElementById('info-noticetext').value.trim();
  info.announcement = document.getElementById('info-announcement').value.trim();

  saveChangesLocally();
  if (window.showToast) window.showToast('Business details updated!');
}

/**
 * Sync to localStorage
 */
function saveChangesLocally() {
  localStorage.setItem('radha_menu_data', JSON.stringify(currentAdminData));
}

/**
 * Save to Server / Hostinger API
 */
async function saveChangesToServer() {
  const saveBtn = document.getElementById('save-all-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Hostinger...';
  }

  saveChangesLocally();

  try {
    const res = await fetch('api/menu.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(currentAdminData)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (window.showToast) window.showToast('SUCCESS: All changes saved directly to Hostinger server!');
    } else {
      throw new Error(data.error || 'Server error saving data');
    }
  } catch (err) {
    console.warn('API save failed:', err);
    alert('Changes saved to your browser! Note: If you are running locally without PHP/server.py, please click "Download Backup menu.json" to upload it to Hostinger.');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save All Changes to Server';
    }
  }
}

/**
 * Download updated menu.json backup
 */
function downloadBackupJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAdminData, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "menu.json");
  dlAnchorElem.click();
  if (window.showToast) window.showToast('Downloaded menu.json backup file!');
}
