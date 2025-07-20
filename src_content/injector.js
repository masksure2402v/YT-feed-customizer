import { injectionState } from './injectionState.js';
import { injectVideoTile } from './videoTile.js';
import { organizeVideosByChannel, getRoundRobinVideos } from './organizeVideos.js';

export function injectVideosToHomePage(channelVideos, videoFrequency) {
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

export function performInjection() {
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

export function setupContinuousInjection() {
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

export function setupVideoInjection() {
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