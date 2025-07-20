const y={channelVideos:{},videoFrequency:3,currentVideoIndex:0,isInjecting:!1};function j(){if(document.querySelector("#my-injected-style"))return;const t=document.createElement("style");t.id="my-injected-style",t.textContent=`
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

  `,document.head.appendChild(t)}function I(t){const e=parseInt(t);if(isNaN(e))return"0 views";if(e>=1e6){const n=(e/1e6).toFixed(1);return(n.endsWith(".0")?n.slice(0,-2):n)+"M views"}return e>=1e3?Math.floor(e/1e3)+"K views":e+" views"}function T(t){const e=new Date,n=new Date(t),o=Math.floor((e-n)/1e3),i=[{label:"year",seconds:31536e3},{label:"month",seconds:2592e3},{label:"week",seconds:604800},{label:"day",seconds:86400},{label:"hour",seconds:3600},{label:"minute",seconds:60}];for(let s of i){const c=Math.floor(o/s.seconds);if(c>=1)return`${c} ${s.label}${c>1?"s":""} ago`}return"Just now"}function x(t,e=1e4){return new Promise((n,o)=>{const i=document.querySelector(t);if(i)return n(i);const s=new MutationObserver(()=>{const c=document.querySelector(t);c&&(s.disconnect(),n(c))});s.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{s.disconnect(),o(new Error("Timeout waiting for: "+t))},e)})}function N(t,e,n=1){if(!e?.videoId)return;j();const o=document.createElement("div");o.innerHTML=`
    <ytd-rich-item-renderer class="style-scope ytd-rich-grid-renderer my-real-video" data-video-id="${e.videoId}">
      <ytd-rich-grid-media class="style-scope ytd-rich-item-renderer">
        <div id="content" class="style-scope ytd-rich-grid-media">
          <a href="https://www.youtube.com/watch?v=${e.videoId}" class="yt-simple-endpoint style-scope ytd-rich-grid-media" tabindex="-1">
            <div id="dismissible" class="style-scope ytd-rich-grid-media">

              <!-- Thumbnail -->
              <div id="thumbnail" class="style-scope ytd-rich-grid-media">
                <ytd-thumbnail class="style-scope ytd-rich-grid-media">
                  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" href="https://www.youtube.com/watch?v=${e.videoId}">
                    <yt-image class="style-scope ytd-thumbnail">
                      <img src="${e.thumbnail}" alt="${e.title}" width="100%" style="aspect-ratio: 16 / 9; object-fit: cover;" />
                    </yt-image>
                  </a>
                </ytd-thumbnail>
              </div>

              <!-- Meta with avatar aligned horizontally -->
              <div id="meta" class="style-scope ytd-rich-grid-media">
                <div id="metadata-container" class="style-scope ytd-rich-grid-media" style="display: flex;">
                  
                  <!-- Avatar -->
                  <div id="avatar-container" class="yt-simple-endpoint style-scope ytd-rich-grid-media">
                    <a id="avatar-link" class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/channel/${e.channelId}" title="${e.channelName}" tabindex="-1">
                      <yt-img-shadow id="avatar-image" class="style-scope ytd-rich-grid-media no-transition" style="background-color: transparent;" width="48">
                        <img id="img" class="style-scope yt-img-shadow" src="${e.channelLogo}" width="48" draggable="false" alt="${e.channelName}">
                      </yt-img-shadow>
                    </a>
                  </div>

                  <!-- Text block: title + meta -->
                  <div id="text-container" class="style-scope ytd-rich-grid-media">
                    <h3 class="style-scope ytd-rich-grid-media">
                      <a class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/watch?v=${e.videoId}">
                        <span class="style-scope ytd-rich-grid-media">${e.title}</span>
                      </a>
                    </h3>

                    <ytd-video-meta-block class="style-scope ytd-rich-grid-media">
                      <div id="metadata" class="style-scope ytd-video-meta-block">
                        <ytd-channel-name class="style-scope ytd-video-meta-block">
                          <div class="style-scope ytd-channel-name">
                            <a class="yt-simple-endpoint style-scope ytd-channel-name" href="https://www.youtube.com/channel/${e.channelId}">
                              <span class="style-scope ytd-channel-name">${e.channelName}</span>
                            </a>
                          </div>
                        </ytd-channel-name>

                        <div id="metadata-line" class="style-scope ytd-video-meta-block">
                          <span class="views style-scope ytd-video-meta-block">${I(e.views)}</span>
                          <span class="views style-scope ytd-video-meta-block">${T(e.published)}</span>
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
  `;const i=t.children[n]||null;t.insertBefore(o.firstElementChild,i)}function E(t){const e={};if(!t||typeof t!="object")return console.warn("❌ Invalid scrapedVideos structure"),e;for(const[n,o]of Object.entries(t))try{o.videos1&&Array.isArray(o.videos1)?(e[n]=o.videos1.sort((i,s)=>new Date(s.published)-new Date(i.published)),console.log(`✅ Organized ${e[n].length} videos from ${n}`)):console.warn(`❌ No videos1 array found for channel: ${n}`)}catch(i){console.error(`💥 Error organizing channel ${n}:`,i)}return e}function k(t,e=10,n=0){const o=Object.keys(t),i=[];if(o.length===0)return console.warn("❌ No channels available for round-robin selection"),i;let s=n%o.length;const c={};o.forEach((r,d)=>{c[r]=Math.floor((n+d)/o.length)});for(let r=0;r<e;r++){const d=o[s],l=c[d];if(l<t[d].length&&(i.push(t[d][l]),c[d]++,console.log(`🎬 Selected video ${l+1} from ${d} (total selected: ${i.length})`)),s=(s+1)%o.length,i.length>0&&o.every(a=>c[a]>=t[a].length)&&(console.log("📝 All channels exhausted, cycling back to start"),o.forEach(a=>{c[a]=0}),l>=t[d].length))break}return i}function w(t,e){if(!document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer")){console.warn("❌ YouTube container not ready. Retrying in 100ms..."),setTimeout(()=>w(t,e),100);return}y.channelVideos=t,y.videoFrequency=e,m(),M()}function m(){const t=document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");if(!t)return;const e=t.children.length,{videoFrequency:n,currentVideoIndex:o}=y;console.log(`📊 Total YouTube videos: ${e}, Video frequency: ${n}, Current video index: ${o}`);const i=Math.floor(e/n),s=t.querySelectorAll(".my-real-video").length,c=i-s;if(console.log(`🎯 Max possible injections: ${i}, Already injected: ${s}, New needed: ${c}`),c<=0){console.log("✅ No new injections needed right now");return}const r=k(y.channelVideos,c,y.currentVideoIndex);if(r.length===0){console.warn("❌ No more videos available for injection");return}const d=[];for(let l=0;l<r.length;l++){const a=(s+l+1)*n;d.push(a)}console.log(`🎯 New injection positions: ${d.join(", ")}`),r.forEach((l,a)=>{const h=d[a];h<=t.children.length+a+1&&(N(t,l,h),console.log(`✅ Injected video "${l.title}" at position ${h}`))}),y.currentVideoIndex+=r.length}function M(){if(y.isInjecting)return;y.isInjecting=!0;const t=document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");if(!t)return;new MutationObserver(n=>{let o=!1;n.forEach(i=>{if(i.type==="childList"&&i.addedNodes.length>0){const c=Array.from(i.addedNodes).filter(r=>r.nodeType===Node.ELEMENT_NODE&&r.tagName==="YTD-RICH-ITEM-RENDERER"&&!r.classList.contains("my-real-video"));c.length>0&&(o=!0,console.log(`🆕 Detected ${c.length} new YouTube videos`))}}),o&&setTimeout(()=>{m()},500)}).observe(t,{childList:!0,subtree:!1}),setInterval(()=>{m()},3e3),console.log("🔄 Continuous injection setup complete")}function v(){chrome.storage.local.get(["scrapedVideos","videoFrequency"],async({scrapedVideos:t,videoFrequency:e})=>{if(console.log("📦 Retrieved from storage:",{scrapedVideos:t,videoFrequency:e}),!t||Object.keys(t).length===0){console.warn("❌ No scraped videos found in storage.");return}const n=e||3;console.log(`🔄 Using video frequency: ${n}`);const o=E(t);if(Object.keys(o).length===0){console.warn("❌ No videos found in scraped data.");return}w(o,n)})}function g(){x("div#contents.style-scope.ytd-rich-grid-renderer",1e4).then(e=>{const n=new MutationObserver((o,i)=>{const s=e.querySelectorAll("ytd-rich-item-renderer:not(.my-real-video)");s.length>=10&&(console.log(`✅ YouTube loaded ${s.length} videos. Now injecting...`),i.disconnect(),v())});n.observe(e,{childList:!0,subtree:!1}),setTimeout(()=>{e.querySelectorAll(".my-real-video").length===0&&(console.warn("⚠️ Timeout fallback — forcing injection"),v(),n.disconnect())},5e3)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g();window.addEventListener("yt-navigate-finish",()=>{console.log("🔁 yt-navigate-finish triggered."),g()});function S(t){const e=parseInt(t);if(isNaN(e))return"0 views";if(e>=1e6){const n=(e/1e6).toFixed(1);return(n.endsWith(".0")?n.slice(0,-2):n)+"M views"}return e>=1e3?Math.floor(e/1e3)+"K views":e+" views"}function q(t){const e=new Date,n=new Date(t),o=Math.floor((e-n)/1e3),i=[{label:"year",seconds:31536e3},{label:"month",seconds:2592e3},{label:"week",seconds:604800},{label:"day",seconds:86400},{label:"hour",seconds:3600},{label:"minute",seconds:60}];for(let s of i){const c=Math.floor(o/s.seconds);if(c>=1)return`${c} ${s.label}${c>1?"s":""} ago`}return"Just now"}function A(){if(document.querySelector("#my-injected-style"))return;const t=document.createElement("style");t.id="my-injected-style",t.textContent=`
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

  `,document.head.appendChild(t)}function V(t,e,n=1){if(!e?.videoId)return;A();const o=document.createElement("div");o.innerHTML=`
    <ytd-rich-item-renderer class="style-scope ytd-rich-grid-renderer my-real-video" data-video-id="${e.videoId}">
      <ytd-rich-grid-media class="style-scope ytd-rich-item-renderer">
        <div id="content" class="style-scope ytd-rich-grid-media">
          <a href="https://www.youtube.com/watch?v=${e.videoId}" class="yt-simple-endpoint style-scope ytd-rich-grid-media" tabindex="-1">
            <div id="dismissible" class="style-scope ytd-rich-grid-media">

              <!-- Thumbnail -->
              <div id="thumbnail" class="style-scope ytd-rich-grid-media">
                <ytd-thumbnail class="style-scope ytd-rich-grid-media">
                  <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" href="https://www.youtube.com/watch?v=${e.videoId}">
                    <yt-image class="style-scope ytd-thumbnail">
                      <img src="${e.thumbnail}" alt="${e.title}" width="100%" style="aspect-ratio: 16 / 9; object-fit: cover;" />
                    </yt-image>
                  </a>
                </ytd-thumbnail>
              </div>

              <!-- Meta with avatar aligned horizontally -->
              <div id="meta" class="style-scope ytd-rich-grid-media">
                <div id="metadata-container" class="style-scope ytd-rich-grid-media" style="display: flex;">
                  
                  <!-- Avatar -->
                  <div id="avatar-container" class="yt-simple-endpoint style-scope ytd-rich-grid-media">
                    <a id="avatar-link" class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/channel/${e.channelId}" title="${e.channelName}" tabindex="-1">
                      <yt-img-shadow id="avatar-image" class="style-scope ytd-rich-grid-media no-transition" style="background-color: transparent;" width="48">
                        <img id="img" class="style-scope yt-img-shadow" src="${e.channelLogo}" width="48" draggable="false" alt="${e.channelName}">
                      </yt-img-shadow>
                    </a>
                  </div>

                  <!-- Text block: title + meta -->
                  <div id="text-container" class="style-scope ytd-rich-grid-media">
                    <h3 class="style-scope ytd-rich-grid-media">
                      <a class="yt-simple-endpoint style-scope ytd-rich-grid-media" href="https://www.youtube.com/watch?v=${e.videoId}">
                        <span class="style-scope ytd-rich-grid-media">${e.title}</span>
                      </a>
                    </h3>

                    <ytd-video-meta-block class="style-scope ytd-rich-grid-media">
                      <div id="metadata" class="style-scope ytd-video-meta-block">
                        <ytd-channel-name class="style-scope ytd-video-meta-block">
                          <div class="style-scope ytd-channel-name">
                            <a class="yt-simple-endpoint style-scope ytd-channel-name" href="https://www.youtube.com/channel/${e.channelId}">
                              <span class="style-scope ytd-channel-name">${e.channelName}</span>
                            </a>
                          </div>
                        </ytd-channel-name>

                        <div id="metadata-line" class="style-scope ytd-video-meta-block">
                          <span class="views style-scope ytd-video-meta-block">${S(e.views)}</span>
                          <span class="views style-scope ytd-video-meta-block">${q(e.published)}</span>
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
  `;const i=t.children[n]||null;t.insertBefore(o.firstElementChild,i)}function L(t){const e={};if(!t||typeof t!="object")return console.warn("❌ Invalid scrapedVideos structure"),e;for(const[n,o]of Object.entries(t))try{o.videos1&&Array.isArray(o.videos1)?(e[n]=o.videos1.sort((i,s)=>new Date(s.published)-new Date(i.published)),console.log(`✅ Organized ${e[n].length} videos from ${n}`)):console.warn(`❌ No videos1 array found for channel: ${n}`)}catch(i){console.error(`💥 Error organizing channel ${n}:`,i)}return e}function C(t,e=10,n=0){const o=Object.keys(t),i=[];if(o.length===0)return console.warn("❌ No channels available for round-robin selection"),i;let s=n%o.length;const c={};o.forEach((r,d)=>{c[r]=Math.floor((n+d)/o.length)});for(let r=0;r<e;r++){const d=o[s],l=c[d];if(l<t[d].length&&(i.push(t[d][l]),c[d]++,console.log(`🎬 Selected video ${l+1} from ${d} (total selected: ${i.length})`)),s=(s+1)%o.length,i.length>0&&o.every(a=>c[a]>=t[a].length)&&(console.log("📝 All channels exhausted, cycling back to start"),o.forEach(a=>{c[a]=0}),l>=t[d].length))break}return i}let u={channelVideos:{},videoFrequency:3,currentVideoIndex:0,isInjecting:!1};function $(t,e){if(!document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer")){console.warn("❌ YouTube container not ready. Retrying in 100ms..."),setTimeout(()=>$(t,e),100);return}u.channelVideos=t,u.videoFrequency=e,f(),D()}function f(){const t=document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");if(!t)return;const e=t.children.length,{videoFrequency:n,currentVideoIndex:o}=u;console.log(`📊 Total YouTube videos: ${e}, Video frequency: ${n}, Current video index: ${o}`);const i=Math.floor(e/n),s=t.querySelectorAll(".my-real-video").length,c=i-s;if(console.log(`🎯 Max possible injections: ${i}, Already injected: ${s}, New needed: ${c}`),c<=0){console.log("✅ No new injections needed right now");return}const r=C(u.channelVideos,c,u.currentVideoIndex);if(r.length===0){console.warn("❌ No more videos available for injection");return}const d=[];for(let l=0;l<r.length;l++){const a=(s+l+1)*n;d.push(a)}console.log(`🎯 New injection positions: ${d.join(", ")}`),r.forEach((l,a)=>{const h=d[a];h<=t.children.length+a+1&&(V(t,l,h),console.log(`✅ Injected video "${l.title}" at position ${h}`))}),u.currentVideoIndex+=r.length}function D(){if(u.isInjecting)return;u.isInjecting=!0;const t=document.querySelector("div#contents.style-scope.ytd-rich-grid-renderer");if(!t)return;new MutationObserver(n=>{let o=!1;n.forEach(i=>{if(i.type==="childList"&&i.addedNodes.length>0){const c=Array.from(i.addedNodes).filter(r=>r.nodeType===Node.ELEMENT_NODE&&r.tagName==="YTD-RICH-ITEM-RENDERER"&&!r.classList.contains("my-real-video"));c.length>0&&(o=!0,console.log(`🆕 Detected ${c.length} new YouTube videos`))}}),o&&setTimeout(()=>{f()},500)}).observe(t,{childList:!0,subtree:!1}),setInterval(()=>{f()},3e3),console.log("🔄 Continuous injection setup complete")}async function b(){chrome.storage.local.get(["scrapedVideos","videoFrequency"],async({scrapedVideos:t,videoFrequency:e})=>{if(console.log("📦 Retrieved from storage:",{scrapedVideos:t,videoFrequency:e}),!t||Object.keys(t).length===0){console.warn("❌ No scraped videos found in storage.");return}const n=e||3;console.log(`🔄 Using video frequency: ${n}`);const o=L(t);if(Object.keys(o).length===0){console.warn("❌ No videos found in scraped data.");return}$(o,n)})}function O(t,e=1e4){return new Promise((n,o)=>{const i=document.querySelector(t);if(i)return n(i);const s=new MutationObserver(()=>{const c=document.querySelector(t);c&&(s.disconnect(),n(c))});s.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{s.disconnect(),o(new Error("Timeout waiting for: "+t))},e)})}function p(){O("div#contents.style-scope.ytd-rich-grid-renderer",1e4).then(e=>{const n=new MutationObserver((o,i)=>{const s=e.querySelectorAll("ytd-rich-item-renderer:not(.my-real-video)");s.length>=10&&(console.log(`✅ YouTube loaded ${s.length} videos. Now injecting...`),i.disconnect(),b())});n.observe(e,{childList:!0,subtree:!1}),setTimeout(()=>{e.querySelectorAll(".my-real-video").length===0&&(console.warn("⚠️ Timeout fallback — forcing injection"),b(),n.disconnect())},5e3)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",p):p();window.addEventListener("yt-navigate-finish",()=>{console.log("🔁 yt-navigate-finish triggered."),p()});
