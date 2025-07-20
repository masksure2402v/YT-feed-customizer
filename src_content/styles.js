export function injectFinalStyles() {
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