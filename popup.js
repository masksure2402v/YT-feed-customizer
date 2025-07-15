const API_KEY = 'AIzaSyBopwfGD7jMnQ4MXbvPcfHZ7BJaj_awnSk';

/**
 * 🔄 Convert @handle → channelId, uploadsPlaylistId, and thumbnail
 */
async function getChannelInfoFromHandle(handle) {
  // Remove '@' if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

  // Use the channels endpoint with forHandle
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&forHandle=${encodeURIComponent(cleanHandle)}&key=${API_KEY}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("❌ Channel not found.");
  }

  const channelId = channelData.items[0].id;
  const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
  const channelLogo = channelData.items[0].snippet?.thumbnails?.high?.url;

  if (!uploadsPlaylistId || !channelLogo) {
    throw new Error("❌ Could not get all required data for channel.");
  }

  return { channelId, uploadsPlaylistId, channelLogo };
}

/**
 * 📋 Display the list of saved channels
 */
function displayChannels(channels) {
  const channelsList = document.getElementById('channelsList');
  
  if (!channels || channels.length === 0) {
    channelsList.innerHTML = '<div class="no-channels">No channels added yet</div>';
    return;
  }

  channelsList.innerHTML = channels.map((channel, index) => `
    <div class="channel-item">
      <div class="channel-info">
        <img src="${channel.channelLogo}" alt="${channel.handle}" class="channel-thumbnail" onerror="this.style.display='none'">
        <span class="channel-handle">${channel.handle}</span>
      </div>
      <button class="delete-btn" data-index="${index}">Delete</button>
    </div>
  `).join('');

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      deleteChannel(index);
    });
  });
}

/**
 * 🗑️ Delete a channel from storage
 */
function deleteChannel(index) {
  chrome.storage.local.get(["channels"], (result) => {
    const channels = result.channels || [];
    
    if (index >= 0 && index < channels.length) {
      const deletedChannel = channels[index];
      channels.splice(index, 1);
      
      chrome.storage.local.set({ channels }, () => {
        console.log("🗑️ Deleted channel:", deletedChannel.handle);
        displayChannels(channels);
        alert(`✅ Deleted ${deletedChannel.handle}`);
      });
    }
  });
}

/**
 * 🎚️ Update frequency display and buttons
 */
function updateFrequencyDisplay(frequency) {
  const frequencyValue = document.getElementById('frequencyValue');
  const frequencySlider = document.getElementById('frequencySlider');
  const decreaseBtn = document.getElementById('decreaseBtn');
  const increaseBtn = document.getElementById('increaseBtn');
  
  frequencyValue.textContent = frequency;
  frequencySlider.value = frequency;
  
  // Update button states
  decreaseBtn.disabled = frequency <= 1;
  increaseBtn.disabled = frequency >= 20;
}

/**
 * 💾 Save frequency to storage
 */
function saveFrequency(frequency) {
  chrome.storage.local.set({ videoFrequency: frequency }, () => {
    console.log("🎚️ Saved frequency:", frequency);
    updateFrequencyDisplay(frequency);
  });
}

/**
 * 📊 Load frequency from storage
 */
function loadFrequency() {
  chrome.storage.local.get(["videoFrequency"], (result) => {
    const frequency = result.videoFrequency || 5; // Default to 5
    updateFrequencyDisplay(frequency);
  });
}

/**
 * 🔄 Load and display channels when popup opens
 */
document.addEventListener('DOMContentLoaded', () => {
  // Load channels
  chrome.storage.local.get(["channels"], (result) => {
    displayChannels(result.channels || []);
  });
  
  // Load frequency settings
  loadFrequency();
  
  // Setup frequency controls
  setupFrequencyControls();
});

/**
 * 🎛️ Setup frequency control event listeners
 */
function setupFrequencyControls() {
  const frequencySlider = document.getElementById('frequencySlider');
  const decreaseBtn = document.getElementById('decreaseBtn');
  const increaseBtn = document.getElementById('increaseBtn');
  
  // Slider change
  frequencySlider.addEventListener('input', (e) => {
    const frequency = parseInt(e.target.value);
    saveFrequency(frequency);
  });
  
  // Decrease button
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(frequencySlider.value);
    if (currentValue > 1) {
      saveFrequency(currentValue - 1);
    }
  });
  
  // Increase button
  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(frequencySlider.value);
    if (currentValue < 20) {
      saveFrequency(currentValue + 1);
    }
  });
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
        displayChannels(channels);
        alert(`✅ Channel saved! ${handle}`);
      });
    });
  } catch (err) {
    console.error("💥 Failed:", err);
    alert("❌ Could not fetch channel info. Make sure the handle is valid.");
  }
});
