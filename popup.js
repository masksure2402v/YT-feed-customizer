const API_KEY = 'AIzaSyBopwfGD7jMnQ4MXbvPcfHZ7BJaj_awnSk';

/**
 * 🔄 Convert @handle → channelId, uploadsPlaylistId, and thumbnail
 */
async function getChannelInfoFromHandle(handle) {
  // Step 1: Get the channel ID from handle
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (!searchData.items?.length) {
    throw new Error("❌ Channel not found.");
  }

  const channelId = searchData.items[0].id.channelId;

  // Step 2: Get uploadsPlaylistId + thumbnail from channel info
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${API_KEY}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();

  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  const channelLogo = channelData.items?.[0]?.snippet?.thumbnails?.high?.url;

  if (!uploadsPlaylistId || !channelLogo) {
    throw new Error("❌ Could not get all required data for channel.");
  }

  return { channelId, uploadsPlaylistId, channelLogo };
}

/**
 * 🎯 Handle popup form submission
 */
document.querySelector("#addChannelBtn").addEventListener("click", async () => {
  const input = document.querySelector("#channelInput");
  const handle = input.value.trim();

  if (!handle.startsWith("@")) {
    alert("⚠️ Handle must start with '@'");
    return;
  }

  try {
    const { channelId, uploadsPlaylistId, channelLogo } = await getChannelInfoFromHandle(handle);
    console.log("✅ Resolved:", { channelId, uploadsPlaylistId, channelLogo });

    chrome.storage.local.get(["channels"], (result) => {
      const channels = result.channels || [];

      // Check for duplicates
      const alreadyExists = channels.some((ch) => ch.channelId === channelId);
      if (alreadyExists) {
        alert("⚠️ Channel already added.");
        return;
      }

      channels.push({ handle, channelId, uploadsPlaylistId, channelLogo });

      chrome.storage.local.set({ channels }, () => {
        console.log("📦 Saved channel:", { handle, channelId, uploadsPlaylistId, channelLogo });
        input.value = "";
        alert(`✅ Channel saved! ${handle}`);
      });
    });
  } catch (err) {
    console.error("💥 Failed:", err);
    alert("❌ Could not fetch channel info. Make sure the handle is valid.");
  }
});
