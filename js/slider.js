/**
 * slider.js - Namaste Biryani Inspired Scrolling Photo Carousel
 * Handles dynamic slide rendering, continuous infinite scrolling, touch swipe, and manual navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initPhotoCarousel();
});

async function initPhotoCarousel() {
  const track = document.getElementById('photo-carousel-track');
  if (!track) return;

  // Wait for RadhaData if not yet loaded
  let photos = window.RadhaData && window.RadhaData.sliderPhotos;
  if (!photos || photos.length === 0) {
    try {
      const res = await fetch('data/menu.json');
      const data = await res.json();
      photos = data.sliderPhotos || [];
    } catch (e) {
      console.error('Failed to load slider photos:', e);
      return;
    }
  }

  if (photos.length === 0) return;

  // Render cards
  renderSlideCards(track, photos);

  // Setup carousel controls
  setupCarouselControls(track);
}

function renderSlideCards(track, photos) {
  track.innerHTML = '';

  // Function to create a card element
  const createCard = (photo) => {
    const card = document.createElement('div');
    card.className = 'photo-slide-card';
    card.setAttribute('role', 'article');
    card.innerHTML = `
      <div class="photo-slide-image-box">
        <img src="${photo.image}" alt="${photo.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80'" />
        <span class="photo-slide-badge">${photo.category || 'Pure Veg'}</span>
        <div class="photo-slide-veg-icon" title="100% Pure Vegetarian"></div>
      </div>
      <div class="photo-slide-info">
        <div class="photo-slide-cat">${photo.category || 'Radha Special'}</div>
        <h4 class="photo-slide-title">${photo.title}</h4>
        <p class="photo-slide-tagline">${photo.tagline || 'Cooked fresh with authentic homestyle flavors'}</p>
        <a href="${photo.link || 'menu.html'}" class="photo-slide-link">
          <span>Explore Menu</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    `;

    // Make entire card clickable
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = photo.link || 'menu.html';
      }
    });

    return card;
  };

  // Append original set
  photos.forEach(photo => track.appendChild(createCard(photo)));
  // Append duplicated set for seamless infinite 360 loop
  photos.forEach(photo => track.appendChild(createCard(photo)));

  // Dynamically adjust animation duration based on card count
  const totalCards = photos.length * 2;
  const speedSeconds = Math.max(25, totalCards * 2.8);
  track.style.animationDuration = `${speedSeconds}s`;
}

function setupCarouselControls(track) {
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  const wrapper = track.parentElement;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      pauseAnimationBriefly(track);
      wrapper.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      pauseAnimationBriefly(track);
      wrapper.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  // Touch & Drag Support
  let isDown = false;
  let startX;
  let scrollLeft;

  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
    track.style.animationPlayState = 'paused';
  });

  wrapper.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.animationPlayState = 'running';
  });

  wrapper.addEventListener('mouseup', () => {
    isDown = false;
    track.style.animationPlayState = 'running';
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrapper.scrollLeft = scrollLeft - walk;
  });
}

function pauseAnimationBriefly(track) {
  track.style.animationPlayState = 'paused';
  clearTimeout(track.resumeTimer);
  track.resumeTimer = setTimeout(() => {
    track.style.animationPlayState = 'running';
  }, 5000);
}
