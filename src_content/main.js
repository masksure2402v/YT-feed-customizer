import { setupVideoInjection } from './injector.js';
import { waitForElement } from './utils.js';

function waitForYouTubeToFinishThenInject() {
  const GRID_SELECTOR = "div#contents.style-scope.ytd-rich-grid-renderer";

  waitForElement(GRID_SELECTOR, 10000).then(container => {
    const observer = new MutationObserver((mutations, obs) => {
      const ytVideos = container.querySelectorAll(
        'ytd-rich-item-renderer:not(.my-real-video)'
      );

      // Wait until YouTube has loaded enough of its own videos
      if (ytVideos.length >= 10) {
        console.log(`✅ YouTube loaded ${ytVideos.length} videos. Now injecting...`);
        obs.disconnect(); // Stop observing
        setupVideoInjection();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: false,
    });

    // Fallback: inject anyway if not ready after 5s
    setTimeout(() => {
      if (container.querySelectorAll('.my-real-video').length === 0) {
        console.warn("⚠️ Timeout fallback — forcing injection");
        setupVideoInjection();
        observer.disconnect();
      }
    }, 5000);
  });
}

// Call on initial load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForYouTubeToFinishThenInject);
} else {
  waitForYouTubeToFinishThenInject();
}

// Also call on YouTube internal SPA navigation
window.addEventListener("yt-navigate-finish", () => {
  console.log("🔁 yt-navigate-finish triggered.");
  waitForYouTubeToFinishThenInject();
}); 