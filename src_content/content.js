// content.js
// Entry point for the content script. All logic is now modularized.
import './main.js';

function formatViews(views) {
  const num = parseInt(views);
  if (isNaN(num)) return "0 views";

  if (num >= 1_000_000) {
    const m = (num / 1_000_000).toFixed(1);
    return (m.endsWith(".0") ? m.slice(0, -2) : m) + "M views";
  }

  if (num >= 1_000) {
    return Math.floor(num / 1_000) + "K views";
  }

  return num + " views";
}

function timeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);

  const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (let u of units) {
    const val = Math.floor(diff / u.seconds);
    if (val >= 1) return `${val} ${u.label}${val > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
}
function injectFinalStyles() {
  if (document.querySelector("#my-injected-style")) return;

  const style = document.createElement("style");
  style.id = "my-injected-style";
  style.textContent = `
    .my-real-video {
      top: -20px
    }
    .my-real-video img{
      border-radius: 12px;
    }
    .style-scope.ytd-rich-grid-media{
      font-size: 15px
    }  
    .views{
      font-size: 14px
    }
    .my-real-video #metadata {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13.5px;
      color: var(--yt-spec-text-secondary);
    }

    .my-real-video ytd-channel-name a {
      color: #A5A5A5 !important;
      font-size: 14px;
      font-weight: 400;
      text-decoration: none;
    }

  `;
  document.head.appendChild(style);
}
function injectVideoTile(container, video, position = 1) {
  if (!video?.videoId) return;

  injectFinalStyles();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <ytd-rich-item-renderer class="style-scope ytd-rich-grid-renderer my-real-video" data-video-id="${video.videoId}">
      <ytd-rich-grid-media class="style-scope ytd-rich-item-renderer">
        <div id="content" class="style-scope ytd-rich-grid-media">
          <a href="https://www.youtube.com/watch?v=${video.videoId}" class="yt-simple-endpoint style-scope ytd-rich-grid-media" tabindex="-1">
            <div id="dismissible" class="style-scope ytd-rich-grid-media">

              <!-- Thumbnail -->
              <div id="thumbnail" class="style-scope ytd-rich-grid-media">
                <ytd-thumbnail class="style-scope ytd-rich-grid-media">
                  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" href="https://www.youtube.com/watch?v=${video.videoId}">
                    <yt-image class="style-scope ytd-thumbnail">
                      <img src="${video.thumbnail}" alt="${video.title}" width="100%" style="aspect-ratio: 16 / 9; object-fit: cover;" />
                    </yt-image>
                  </a>
                </ytd-thumbnail>
              </div>

              <!-- Meta with avatar aligned horizontally -->
              <div id="meta" class="style-scope ytd-rich-grid-media">
                <div id="metadata-container" class="style-scope ytd-rich-grid-media" style="display: flex;">
                  
                  <!-- Avatar -->
                  <div id="avatar-container" class="yt-simple-endpoint style-scope ytd-rich-grid-media">
                    <a id="avatar-link" class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/channel/${video.channelId}" title="${video.channelName}" tabindex="-1">
                      <yt-img-shadow id="avatar-image" class="style-scope ytd-rich-grid-media no-transition" style="background-color: transparent;" width="48">
                        <img id="img" class="style-scope yt-img-shadow" src="${video.channelLogo}" width="48" draggable="false" alt="${video.channelName}">
                      </yt-img-shadow>
                    </a>
                  </div>

                  <!-- Text block: title + meta -->
                  <div id="text-container" class="style-scope ytd-rich-grid-media">
                    <h3 class="style-scope ytd-rich-grid-media">
                      <a class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/watch?v=${video.videoId}">
                        <span class="style-scope ytd-rich-grid-media">${video.title}</span>
                      </a>
                    </h3>

                    <ytd-video-meta-block class="style-scope ytd-rich-grid-media">
                      <div id="metadata" class="style-scope ytd-video-meta-block">
                        <ytd-channel-name class="style-scope ytd-video-meta-block">
                          <div class="style-scope ytd-channel-name">
                            <a class="yt-simple-endpoint style-scope ytd-channel-name" href="https://www.youtube.com/channel/${video.channelId}">
                              <span class="style-scope ytd-channel-name">${video.channelName}</span>
                            </a>
                          </div>
                        </ytd-channel-name>

                        <div id="metadata-line" class="style-scope ytd-video-meta-block">
                          <span class="views style-scope ytd-video-meta-block">${formatViews(video.views)}</span>
                          <span class="views style-scope ytd-video-meta-block">${timeAgo(video.published)}</span>
                        </div>
                      </div>
                    </ytd-video-meta-block>
                  </div>
                </div>
              </div>

            </div>
          </a>
        </div>
      </ytd-rich-grid-media>
    </ytd-rich-item-renderer>
  `;

  const insertBeforeNode = container.children[position] || null;
  container.insertBefore(wrapper.firstElementChild, insertBeforeNode);
}



// Organize videos by channel for round-robin injection
function organizeVideosByChannel(scrapedVideos) {
  const channelVideos = {};
  
  if (!scrapedVideos || typeof scrapedVideos !== 'object') {
    console.warn("❌ Invalid scrapedVideos structure");
    return channelVideos;
  }

  // Organize videos by channel handle
  for (const [channelHandle, channelData] of Object.entries(scrapedVideos)) {
    try {
      if (channelData.videos1 && Array.isArray(channelData.videos1)) {
        // Sort videos by publication date (newest first)
        channelVideos[channelHandle] = channelData.videos1.sort(
          (a, b) => new Date(b.published) - new Date(a.published)
        );
        console.log(`✅ Organized ${channelVideos[channelHandle].length} videos from ${channelHandle}`);
      } else {
        console.warn(`❌ No videos1 array found for channel: ${channelHandle}`);
      }
    } catch (err) {
      console.error(`💥 Error organizing channel ${channelHandle}:`, err);
    }
  }

  return channelVideos;
}

// Get videos in round-robin fashion from different channels
function getRoundRobinVideos(channelVideos, maxVideos = 10, startIndex = 0) {
  const channels = Object.keys(channelVideos);
  const selectedVideos = [];
  
  if (channels.length === 0) {
    console.warn("❌ No channels available for round-robin selection");
    return selectedVideos;
  }

  let channelIndex = startIndex % channels.length;
  const videoIndexes = {}; // Track which video index we're at for each channel
  
  // Initialize video indexes for each channel based on startIndex
  channels.forEach((channel, index) => {
    videoIndexes[channel] = Math.floor((startIndex + index) / channels.length);
  });

  // Round-robin selection
  for (let i = 0; i < maxVideos; i++) {
    const currentChannel = channels[channelIndex];
    const currentVideoIndex = videoIndexes[currentChannel];
    
    // Check if current channel has more videos
    if (currentVideoIndex < channelVideos[currentChannel].length) {
      selectedVideos.push(channelVideos[currentChannel][currentVideoIndex]);
      videoIndexes[currentChannel]++;
      console.log(`🎬 Selected video ${currentVideoIndex + 1} from ${currentChannel} (total selected: ${selectedVideos.length})`);
    }
    
    // Move to next channel (round-robin)
    channelIndex = (channelIndex + 1) % channels.length;
    
    // If we've cycled through all channels and none have more videos, break
    if (selectedVideos.length > 0 && 
        channels.every(channel => videoIndexes[channel] >= channelVideos[channel].length)) {
      console.log("📝 All channels exhausted, cycling back to start");
      // Reset all video indexes to start cycling through videos again
      channels.forEach(channel => {
        videoIndexes[channel] = 0;
      });
      // If we still can't get a video, break to prevent infinite loop
      if (currentVideoIndex >= channelVideos[currentChannel].length) {
        break;
      }
    }
  }

  return selectedVideos;
}

// Keep track of injection state
let injectionState = {
  channelVideos: {},
  videoFrequency: 3,
  currentVideoIndex: 0,
  isInjecting: false
};

function injectVideosToHomePage(channelVideos, videoFrequency) {
  const container = document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");
  if (!container) {
    console.warn("❌ YouTube container not ready. Retrying in 100ms...");
    setTimeout(() => injectVideosToHomePage(channelVideos, videoFrequency), 100);
    return;
  }

  // Update injection state
  injectionState.channelVideos = channelVideos;
  injectionState.videoFrequency = videoFrequency;

  // Initial injection
  performInjection();

  // Set up observer to watch for new YouTube videos being loaded
  setupContinuousInjection();
}

function performInjection() {
  const container = document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");
  if (!container) return;

  const totalYouTubeVideos = container.children.length;
  const { videoFrequency, currentVideoIndex } = injectionState;
  
  console.log(`📊 Total YouTube videos: ${totalYouTubeVideos}, Video frequency: ${videoFrequency}, Current video index: ${currentVideoIndex}`);

  // Calculate how many more videos we can inject
  const maxPossibleInjections = Math.floor(totalYouTubeVideos / videoFrequency);
  const alreadyInjected = container.querySelectorAll('.my-real-video').length;
  const newInjectionsNeeded = maxPossibleInjections - alreadyInjected;

  console.log(`🎯 Max possible injections: ${maxPossibleInjections}, Already injected: ${alreadyInjected}, New needed: ${newInjectionsNeeded}`);

  if (newInjectionsNeeded <= 0) {
    console.log("✅ No new injections needed right now");
    return;
  }

  // Get videos to inject starting from current index
  const videosToInject = getRoundRobinVideos(
    injectionState.channelVideos, 
    newInjectionsNeeded, 
    injectionState.currentVideoIndex
  );

  if (videosToInject.length === 0) {
    console.warn("❌ No more videos available for injection");
    return;
  }

  // Calculate injection positions for new videos
  const injectionPositions = [];
  for (let i = 0; i < videosToInject.length; i++) {
    const position = (alreadyInjected + i + 1) * videoFrequency;
    injectionPositions.push(position);
  }

  console.log(`🎯 New injection positions: ${injectionPositions.join(', ')}`);

  // Inject videos at calculated positions
  videosToInject.forEach((video, index) => {
    const position = injectionPositions[index];
    if (position <= container.children.length + index + 1) { // Account for videos being added
      injectVideoTile(container, video, position);
      console.log(`✅ Injected video "${video.title}" at position ${position}`);
    }
  });

  // Update current video index
  injectionState.currentVideoIndex += videosToInject.length;
}

function setupContinuousInjection() {
  // Prevent multiple observers
  if (injectionState.isInjecting) return;
  injectionState.isInjecting = true;

  const container = document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");
  if (!container) return;

  // Create observer to watch for new YouTube videos
  const observer = new MutationObserver((mutations) => {
    let newVideosAdded = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if new YouTube videos were added (not our injected ones)
        const addedNodes = Array.from(mutation.addedNodes);
        const newYouTubeVideos = addedNodes.filter(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          node.tagName === 'YTD-RICH-ITEM-RENDERER' &&
          !node.classList.contains('my-real-video')
        );
        
        if (newYouTubeVideos.length > 0) {
          newVideosAdded = true;
          console.log(`🆕 Detected ${newYouTubeVideos.length} new YouTube videos`);
        }
      }
    });

    if (newVideosAdded) {
      // Debounce: wait a bit before injecting to let YouTube finish loading
      setTimeout(() => {
        performInjection();
      }, 500);
    }
  });

  // Start observing
  observer.observe(container, {
    childList: true,
    subtree: false
  });

  // Also set up periodic injection as fallback
  setInterval(() => {
    performInjection();
  }, 3000); // Check every 3 seconds

  console.log("🔄 Continuous injection setup complete");
}

async function setupVideoInjection() {
  chrome.storage.local.get(["scrapedVideos", "videoFrequency"], async ({ scrapedVideos, videoFrequency }) => {
    console.log("📦 Retrieved from storage:", { scrapedVideos, videoFrequency });

    if (!scrapedVideos || Object.keys(scrapedVideos).length === 0) {
      console.warn("❌ No scraped videos found in storage.");
      return;
    }

    // Default frequency to 3 if not set
    const frequency = videoFrequency || 3;
    console.log(`🔄 Using video frequency: ${frequency}`);

    const channelVideos = organizeVideosByChannel(scrapedVideos);
    if (Object.keys(channelVideos).length === 0) {
      console.warn("❌ No videos found in scraped data.");
      return;
    }
    
    injectVideosToHomePage(channelVideos, frequency);
  });
}

// Helper: wait until element exists
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error("Timeout waiting for: " + selector));
    }, timeout);
  });
}

// Reliable trigger for video injection after YouTube fully renders
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
