/**
 * main.js - Shared utilities, navigation, and business info hydration
 * Radha Catering | Pure Vegetarian Catering
 */

const MENU_DATA_URL = 'data/menu.json';
const API_MENU_URL = 'api/menu.php';

// Global state cache
window.RadhaData = {
  businessInfo: null,
  items: [],
  categories: [],
  sliderPhotos: []
};

document.addEventListener('DOMContentLoaded', async () => {
  initMobileNav();
  initHeaderScroll();
  await loadGlobalMenuData();
  hydrateBusinessInfo();
});

/**
 * Loads menu data either from server API, static JSON, or localStorage fallback
 */
async function loadGlobalMenuData() {
  try {
    // Try localStorage first if admin just edited
    const localSaved = localStorage.getItem('radha_menu_data');
    
    // Attempt fetch from PHP API or static data/menu.json
    let response;
    try {
      response = await fetch(API_MENU_URL + '?t=' + Date.now());
      if (!response.ok) throw new Error('API not available, fallback to static JSON');
    } catch (e) {
      response = await fetch(MENU_DATA_URL + '?t=' + Date.now());
    }

    if (response && response.ok) {
      const data = await response.json();
      window.RadhaData = data;
      // Sync to localStorage
      localStorage.setItem('radha_menu_data', JSON.stringify(data));
      return data;
    } else if (localSaved) {
      window.RadhaData = JSON.parse(localSaved);
      return window.RadhaData;
    }
  } catch (err) {
    console.warn('Error loading remote menu data, checking localStorage:', err);
    const localSaved = localStorage.getItem('radha_menu_data');
    if (localSaved) {
      window.RadhaData = JSON.parse(localSaved);
      return window.RadhaData;
    }
  }
}

/**
 * Populates business phone, city, whatsapp, and announcement across all pages
 */
function hydrateBusinessInfo() {
  const info = window.RadhaData.businessInfo;
  if (!info) return;

  // Update phone numbers
  document.querySelectorAll('.js-phone-display').forEach(el => {
    el.textContent = info.phone || '+1 (978) 652-6164';
  });

  document.querySelectorAll('.js-phone-link').forEach(el => {
    el.href = `tel:${info.phoneRaw || '+19786526164'}`;
  });

  // Update WhatsApp links
  const whatsappNum = info.whatsapp || '19786526164';
  document.querySelectorAll('.js-whatsapp-link').forEach(el => {
    const defaultMsg = encodeURIComponent(`Hello Radha Catering! I would like to inquire about vegetarian catering in ${info.cityState || 'Powell, OH'} for an upcoming event.`);
    el.href = `https://wa.me/${whatsappNum}?text=${defaultMsg}`;
  });

  // Update location text
  document.querySelectorAll('.js-location-display').forEach(el => {
    el.textContent = info.cityState || 'Powell, OH';
  });

  // Update Announcement
  const annEl = document.querySelector('.js-announcement-text');
  if (annEl && info.announcement) {
    annEl.textContent = info.announcement;
  }
}

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('open')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close when clicking any nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }
}

/**
 * Header scroll shadow elevation
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
    }
  });
}

/**
 * Toast notification utility
 */
window.showToast = function(message, type = 'success') {
  let toast = document.getElementById('radha-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'radha-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
    toast.style.transition = 'all 0.3s ease';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    document.body.appendChild(toast);
  }

  toast.style.backgroundColor = type === 'success' ? '#166534' : (type === 'error' ? '#b91c1c' : '#c25e00');
  toast.textContent = message;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 3500);
};
