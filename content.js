
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
    { label: 'year',   seconds: 31536000 },
    { label: 'month',  seconds: 2592000 },
    { label: 'week',   seconds: 604800 },
    { label: 'day',    seconds: 86400 },
    { label: 'hour',   seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (let u of units) {
    const val = Math.floor(diff / u.seconds);
    if (val >= 1) return `${val} ${u.label}${val > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
}


async function fetchLatestVideoFromChannel(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url);
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  const entry = xml.querySelector("entry");
  if (!entry) throw new Error("❌ No video found in feed.");

  const ytNS = "http://www.youtube.com/xml/schemas/2015";
  const mediaNS = "http://search.yahoo.com/mrss/";

  const videoId = entry.getElementsByTagNameNS(ytNS, "videoId")[0]?.textContent;
  const title = entry.querySelector("title")?.textContent;
  const published = entry.querySelector("published")?.textContent;
  const views = entry.getElementsByTagNameNS(mediaNS, "statistics")[0]?.getAttribute("views");
  const channelName = xml.querySelector("author > name")?.textContent || "Unknown Channel";

  return {
    videoId,
    title,
    published,
    views,
    channelName,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hq720.jpg`
  };
}





function injectVideoTile(container, video) {
  if (!video?.videoId || container.querySelector(".my-real-video")) return;

  const timeSince = timeAgo(video.published);

  const wrapper = document.createElement("ytd-rich-item-renderer");
  wrapper.className = "style-scope ytd-rich-grid-renderer my-real-video";
  wrapper.innerHTML = `
    <ytd-rich-grid-media class="style-scope ytd-rich-item-renderer">
      <div id="content" class="style-scope ytd-rich-grid-media">
        <a href="https://www.youtube.com/watch?v=${video.videoId}" class="yt-simple-endpoint style-scope ytd-rich-grid-media" tabindex="-1">
          <div id="dismissible" class="style-scope ytd-rich-grid-media">
            <div id="thumbnail" class="style-scope ytd-rich-grid-media">
              <ytd-thumbnail class="style-scope ytd-rich-grid-media">
                <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" href="https://www.youtube.com/watch?v=${video.videoId}">
                  <yt-image class="style-scope ytd-thumbnail">
                    <img src="${video.thumbnail}" width="100%">
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
    </ytd-rich-grid-media>
  `;

  container.insertBefore(wrapper, container.children[1]);

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

async function setupObserver() {
  const target = document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");

  if (!target) {
    console.warn("❌ #contents not found yet. Retrying...");
    setTimeout(setupObserver, 500);
    return;
  }

  injectFinalStyles();

  const channelId = "UCWI-ohtRu8eEeDj93hmUsUQ"; // ✅ CodeWithHarry
  try {
    const video = await fetchLatestVideoFromChannel(channelId);
    console.log("🎯 Channel:", video.channelName);
    
    // ✅ Only inject AFTER video is fetched
    injectVideoTile(target, video);

    // ✅ Observer waits until you have valid data
    const observer = new MutationObserver(() => {
      injectVideoTile(target, video);
    });

    observer.observe(target, { childList: true, subtree: false });
    console.log("👁️ Watching and injecting:", video.title);

  } catch (err) {
    console.error("💥 Failed to fetch video:", err);
  }
}



if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupObserver);
} else {
  setupObserver();
}