
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


function shuffleArray(arr) {
  return arr
    .map(v => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}


function injectVideoTile(container, video) {
  if (!video?.videoId || container.querySelector(".my-real-video")) return;

  injectFinalStyles()
  const wrapper = document.createElement("ytd-rich-item-renderer");
  wrapper.className = "style-scope ytd-rich-grid-renderer my-real-video";
  wrapper.innerHTML = 
    `<ytd-rich-grid-media class="style-scope ytd-rich-item-renderer">
      <div id="content" class="style-scope ytd-rich-grid-media">
        <a href="https://www.youtube.com/watch?v=${video.videoId}" class="yt-simple-endpoint style-scope ytd-rich-grid-media" tabindex="-1">
          <div id="dismissible" class="style-scope ytd-rich-grid-media">
            <div id="thumbnail" class="style-scope ytd-rich-grid-media">
              <ytd-thumbnail class="style-scope ytd-rich-grid-media">
                <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" href="https://www.youtube.com/watch?v=${video.videoId}">
                  <yt-image class="style-scope ytd-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" width="100%" style="aspect-ratio: 16 / 9; object-fit: cover;" />
                  </yt-image>
                </a>
              </ytd-thumbnail>
            </div>

            <div id="meta" class="style-scope ytd-rich-grid-media">
              <h3 class="style-scope ytd-rich-grid-media">
                <a class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/watch?v=${video.videoId}">
                  <span class="style-scope ytd-rich-grid-media">${video.title}</span>
                </a>
              </h3>
              <ytd-video-meta-block class="style-scope ytd-rich-grid-media">
                <div id="metadata" class="style-scope ytd-video-meta-block">
                  <!-- 👇 CHANNEL NAME WILL BE INJECTED MANUALLY -->
                  <div id="metadata-line" class="style-scope ytd-video-meta-block">
                  </div>
                </div>
              </ytd-video-meta-block>
            </div>
          </div>
        </a>
      </div>
    </ytd-rich-grid-media>`
  ;

  container.insertBefore(wrapper, container.children[1]);

  // Avatar block
  const avatarContainer = document.createElement("div");
  avatarContainer.id = "avatar-container";
  avatarContainer.className = "yt-simple-endpoint style-scope ytd-rich-grid-media";

  const avatarLink = document.createElement("a");
  avatarLink.id = "avatar-link";
  avatarLink.className = "yt-simple-endpoint style-scope ytd-rich-grid-media";
  avatarLink.href = `https://www.youtube.com/channel/${video.channelId}`;
  avatarLink.title = video.channelName;
  avatarLink.tabIndex = "-1";

  const ytImgShadow = document.createElement("yt-img-shadow");
  ytImgShadow.id = "avatar-image";
  ytImgShadow.className = "style-scope ytd-rich-grid-media no-transition";
  ytImgShadow.style.backgroundColor = "transparent";
  ytImgShadow.setAttribute("width", "48");

  const img = document.createElement("img");
  img.id = "img";
  img.className = "style-scope yt-img-shadow";
  img.src = video.channelLogo;
  img.width = 48;
  img.draggable = false;
  img.alt = video.channelName;

  ytImgShadow.appendChild(img);
  avatarLink.appendChild(ytImgShadow);
  avatarContainer.appendChild(avatarLink);

  // Create metadata container to wrap avatar + meta
  const metadataContainer = document.createElement("div");
  metadataContainer.id = "metadata-container";
  metadataContainer.className = "style-scope ytd-rich-grid-media";
  metadataContainer.style.display = "flex";

  // Grab the existing meta div
  const meta = wrapper.querySelector("#meta");

  // Move the existing meta into this container
  if (meta) {
    metadataContainer.appendChild(avatarContainer); // 👈 Avatar on the left
    metadataContainer.appendChild(meta);            // 👈 Meta (title, etc.) on the right

    // Replace original meta with new container
    const dismissible = wrapper.querySelector("#dismissible");
    dismissible.appendChild(metadataContainer);
  }


  // Create ytd-channel-name block
  const channelNameWrapper = document.createElement("ytd-channel-name");
  channelNameWrapper.className = "style-scope ytd-video-meta-block";

  const innerDiv = document.createElement("div");
  innerDiv.className = "style-scope ytd-channel-name";

  const channelLink = document.createElement("a");
  channelLink.className = "yt-simple-endpoint style-scope ytd-channel-name";
  channelLink.href = `https://www.youtube.com/channel/${video.channelId}`;

  // Avoid yt-formatted-string, use span
  const channelNameSpan = document.createElement("span");
  channelNameSpan.className = "style-scope ytd-channel-name";
  channelNameSpan.textContent = video.channelName || "Unknown Channel";

  channelLink.appendChild(channelNameSpan);
  innerDiv.appendChild(channelLink);
  channelNameWrapper.appendChild(innerDiv);

  // Create metadata line block (views + time)
  const metadataLine = document.createElement("div");
  metadataLine.id = "metadata-line";
  metadataLine.className = "style-scope ytd-video-meta-block";

  const viewsSpan = document.createElement("span");
  viewsSpan.className = "views style-scope ytd-video-meta-block";
  viewsSpan.textContent = formatViews(video.views);

  const timeSpan = document.createElement("span");
  timeSpan.className = "views style-scope ytd-video-meta-block";
  timeSpan.textContent = timeAgo(video.published);

  metadataLine.appendChild(viewsSpan);
  metadataLine.appendChild(timeSpan);

  // Inject into tile
  const metaBlock = wrapper.querySelector("#metadata");
  if (metaBlock) {
    metaBlock.appendChild(channelNameWrapper);  // 👈 First: Channel Name
    metaBlock.appendChild(metadataLine);        // 👈 Second: Views & Time
    console.log("✅ Injected channel and metadata properly");
  }
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

  // Step 2: Extract video IDs
  const videoIds = data.items
    .map(item => item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) {
    throw new Error("❌ No valid video IDs found");
  }

  // Step 3: Fetch video statistics for all video IDs
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${API_KEY}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();

  const statsMap = {};
  for (const video of statsData.items || []) {
    statsMap[video.id] = {
      views: video.statistics?.viewCount || "0"
    };
  }

  // Step 4: Build the final list
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
        views: Number(statsMap[videoId]?.views || 0), // ✅ Real view count
        channelLogo
      };
    })
    .filter(Boolean);
}






async function setupVideoInjection() {
  // Step 1: Try to get the YouTube video container
  const container = document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");

  if (!container) {
    console.warn("❌ YouTube container not ready. Retrying in 1s...");
    setTimeout(setupVideoInjection, 1000);
    return;
  }

  // Step 2: Retrieve channel list from storage
  chrome.storage.local.get(["channels"], async ({ channels }) => {
    console.log("📦 Retrieved channels from storage:", channels);

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      console.warn("❌ No valid channels found in storage.");
      return;
    }

    // Step 3: Loop through each channel
    for (const { uploadsPlaylistId, handle, channelLogo } of channels) {
      console.log(`📡 Fetching videos for: ${handle} ${channelLogo} (${uploadsPlaylistId})`);

      try {
        const videos = await fetchVideosFromChannel(uploadsPlaylistId, channelLogo);
        console.log(`📺 Fetched ${videos.length} videos for ${handle}:`, videos);

        // const remainingVideos = videos.slice(1);
        // console.log(`🔪 Skipped first video from ${handle}. Remaining:`, remainingVideos);

        // const toInject = shuffleArray(videos);
        // console.log(`🎲 Shuffled videos to inject from ${handle}:`, toInject);

        videos.forEach(video => {
          console.log(`📦 Injecting ${video.title} from ${handle}`);
          injectVideoTile(container, video);
        });

      } catch (err) {
        console.error(`💥 Failed to fetch videos from ${handle} (${uploadsPlaylistId}):`, err);
      }
    }
  });
}




if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupVideoInjection);
} else {
  setupVideoInjection();
}