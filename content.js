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

function injectVideoTile(container, video, position = 1) {
  if (!video?.videoId) return;

  injectFinalStyles();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <ytd-rich-item-renderer class="style-scope ytd-rich-grid-renderer my-real-video">
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

  // Clamp position to valid range
  const insertBeforeNode = container.children[position] || null;
  container.insertBefore(wrapper.firstElementChild, insertBeforeNode);
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

async function fetchVideosFromChannel(uploadsPlaylistId, channelLogo) {
  const API_KEY = "AIzaSyBopwfGD7jMnQ4MXbvPcfHZ7BJaj_awnSk";
  const maxResults = 5;

  // Step 1: Fetch playlist items (basic info)
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("❌ No videos found for playlist: " + uploadsPlaylistId);
  }
  const videoIds = data.items
    .map(item => item.snippet?.resourceId?.videoId)
    .filter(Boolean);
  if (videoIds.length === 0) {
    throw new Error("❌ No valid video IDs found");
  }
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${API_KEY}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();
  const statsMap = {};
  for (const video of statsData.items || []) {
    statsMap[video.id] = {
      views: video.statistics?.viewCount || "0"
    };
  }
  return data.items
    .map(item => {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId) return null;
      return {
        videoId,
        title: snippet.title,
        published: snippet.publishedAt,
        thumbnail: snippet.thumbnails?.high?.url,
        channelId: snippet.channelId,
        channelName: snippet.channelTitle,
        views: Number(statsMap[videoId]?.views || 0),
        channelLogo
      };
    })
    .filter(Boolean);
}

async function getAllVideosFromChannels(channels) {
  let allVideos = [];
  for (const { uploadsPlaylistId, handle, channelLogo } of channels) {
    try {
      const videos = await fetchVideosFromChannel(uploadsPlaylistId, channelLogo);
      allVideos = allVideos.concat(videos);
    } catch (err) {
      console.error(`💥 Failed to fetch videos from ${handle} (${uploadsPlaylistId}):`, err);
    }
  }
  return allVideos;
}



function getLatestNVideos(videos, n = 3) {
  return videos
    .sort((a, b) => new Date(b.published) - new Date(a.published))
    .slice(0, n);
}


function injectVideosToHomePage(videos) {
  const container = document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");
  if (!container) {
    console.warn("❌ YouTube container not ready. Retrying in 1s...");
    setTimeout(() => injectVideosToHomePage(videos), 100);
    return;
  }
  // Example: insert at positions 1, 4, 7 (or any you want)
  const positions = [1, 4, 7];
  videos.forEach((video, i) => {
    injectVideoTile(container, video, positions[i] ?? (i + 1));
  });
}



async function setupVideoInjection() {
  chrome.storage.local.get(["channels"], async ({ channels }) => {
    console.log("📦 Retrieved channels from storage:", channels);

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      console.warn("❌ No valid channels found in storage.");
      return;
    }

    const allVideos = await getAllVideosFromChannels(channels);
    if (!allVideos.length) {
      console.warn("❌ No videos fetched from any channel.");
      return;
    }
    
    const latestVideos = getLatestNVideos(allVideos, 3);
    console.log("🎬 Latest 3 videos:", latestVideos);
    injectVideosToHomePage(latestVideos);
  });
}




if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupVideoInjection);
} else {
  setupVideoInjection();
}