/* ==========================================
   CAFÉ CRUST — SCROLL ANIMATION & INTERACTION
   ========================================== */

const frameCount = 239;
const startFrame = 2;
const endFrame = 240;
const images = [];
let loadedCount = 0;

const canvas = document.getElementById("scroll-canvas");
const context = canvas.getContext("2d");

// Helper to format frame paths (e.g. ./ezgif-714b47a9820c67a5-jpg/ezgif-frame-002.jpg)
const frameName = (index) => {
  const paddedIndex = String(index).padStart(3, '0');
  return `./ezgif-714b47a9820c67a5-jpg/ezgif-frame-${paddedIndex}.jpg`;
};

// 1. PRELOAD IMAGES
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = startFrame; i <= endFrame; i++) {
      const img = new Image();
      img.src = frameName(i);
      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / frameCount) * 100);
        
        // Update loader UI
        document.getElementById("loader-percent").textContent = percent;
        document.getElementById("loader-bar").style.width = percent + "%";
        
        // Dynamic messaging for premium loading experience
        const statusEl = document.querySelector(".loader-status");
        if (percent < 25) {
          statusEl.textContent = "Harvesting single-origin Arabica beans...";
        } else if (percent < 50) {
          statusEl.textContent = "Cultivating wild sourdough starter (fermenting 48 hours)...";
        } else if (percent < 75) {
          statusEl.textContent = "Preheating stone deck wood-fired oven to 900°F...";
        } else if (percent < 95) {
          statusEl.textContent = "Melting creamy burrata and shaving fresh black truffles...";
        } else {
          statusEl.textContent = "Stamping our signature kiss of culinary excellence...";
        }

        if (loadedCount === frameCount) {
          setTimeout(() => {
            // Fade out preloader screen
            document.getElementById("preloader").classList.add("fade-out");
            // Set up canvas sizes and draw first frame
            resizeCanvas();
            // Start scroll listener
            initScroll();
            // Start observers
            initCardsAnimation();
            resolve();
          }, 800);
        }
      };
      
      img.onerror = () => {
        console.warn(`Frame failed to load: ${img.src}. Continuing loading sequence.`);
        loadedCount++;
        if (loadedCount === frameCount) {
          document.getElementById("preloader").classList.add("fade-out");
          resizeCanvas();
          initScroll();
          initCardsAnimation();
          resolve();
        }
      };
      images.push(img);
    }
  });
}

// 2. CANVAS ASPECT-RATIO DRAWING
function drawImage(img) {
  if (!img) return;
  
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  // Clear canvas
  context.clearRect(0, 0, w, h);
  
  // Fill solid white background (logo frames have pure white backgrounds)
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, w, h);

  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;

  let drawWidth, drawHeight;

  if (imgRatio > canvasRatio) {
    drawWidth = w;
    drawHeight = w / imgRatio;
  } else {
    drawHeight = h;
    drawWidth = h * imgRatio;
  }

  // Set scaling depending on screen size for optimal brand showcase spacing
  const scale = w < 768 ? 0.95 : 0.85;
  const finalWidth = drawWidth * scale;
  const finalHeight = drawHeight * scale;

  const x = (w - finalWidth) / 2;
  
  // Shift the logo down on the hero screen, sliding it to center as the user scrolls
  const scrollTop = window.pageYOffset;
  const menuSection = document.getElementById("menu");
  let scrollMax = h; // Fallback
  if (menuSection) {
    const menuTop = menuSection.getBoundingClientRect().top + window.pageYOffset;
    scrollMax = menuTop - h;
  }
  
  // Map progress (0 to 1)
  let progress = scrollMax > 0 ? scrollTop / scrollMax : 0;
  progress = Math.max(0, Math.min(1, progress));

  // Shift down so the top of the logo is just below the 'Scroll to Experience' indicator (80px from bottom)
  const maxShift = (h - 80) - ((h - finalHeight) / 2);
  const shiftProgress = Math.min(1, progress / 0.3);
  const currentShift = Math.max(0, maxShift * (1 - shiftProgress));

  const y = ((h - finalHeight) / 2) + currentShift;

  context.drawImage(img, x, y, finalWidth, finalHeight);
}

// Map current scroll position to frame index
function getCurrentFrameIndex() {
  const menuSection = document.getElementById("menu");
  if (!menuSection) return startFrame;

  const menuTop = menuSection.getBoundingClientRect().top + window.pageYOffset;
  const scrollMax = menuTop - window.innerHeight;
  const scrollTop = window.pageYOffset;

  let progress = scrollTop / scrollMax;
  progress = Math.max(0, Math.min(1, progress));

  const frameIndex = Math.floor(progress * (frameCount - 1)) + startFrame;
  return frameIndex;
}

// Handle resizing (re-scale high DPR and draw current frame)
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  context.scale(dpr, dpr);

  const currentFrame = getCurrentFrameIndex();
  const imgIndex = currentFrame - startFrame;
  if (images[imgIndex]) {
    drawImage(images[imgIndex]);
  }
}

// 3. SCROLL & REQUEST ANIMATION FRAME
let ticking = false;

function updateCanvasFrame() {
  const currentFrame = getCurrentFrameIndex();
  const imgIndex = currentFrame - startFrame;
  if (images[imgIndex]) {
    drawImage(images[imgIndex]);
  }
  ticking = false;
}

function initScroll() {
  window.addEventListener("scroll", () => {
    // Shrink header on scroll
    const header = document.querySelector("header");
    if (window.pageYOffset > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Throttle scroll triggers with requestAnimationFrame
    if (!ticking) {
      window.requestAnimationFrame(updateCanvasFrame);
      ticking = true;
    }
  }, { passive: true });
}

// 4. GLASS-CARDS SCROLL FADES
function initCardsAnimation() {
  const cards = document.querySelectorAll(".glass-card");
  
  const observerOptions = {
    root: null,
    rootMargin: "-15% 0px -15% 0px", // Trigger when items enter the viewport active region
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        // Remove active class to fade elements out when scrolling past them
        entry.target.classList.remove("active");
      }
    });
  }, observerOptions);

  cards.forEach(card => {
    observer.observe(card);
  });
}

// 5. PREMIUM CUSTOM CURSOR & LINK HOVERS
function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  // Move cursor with mouse
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Scale cursor on interactive elements
  const hoverElements = document.querySelectorAll("a, button, .menu-card");
  hoverElements.forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hovered");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hovered");
    });
  });
}

// Initialize application on load
window.addEventListener("DOMContentLoaded", () => {
  initCustomCursor();
  preloadImages();
  window.addEventListener("resize", resizeCanvas);
});
