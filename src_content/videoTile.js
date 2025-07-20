import { injectFinalStyles } from './styles.js';
import { formatViews, timeAgo } from './utils.js';

export function injectVideoTile(container, video, position = 1) {
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