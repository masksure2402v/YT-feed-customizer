export function organizeVideosByChannel(scrapedVideos) {
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

export function getRoundRobinVideos(channelVideos, maxVideos = 10, startIndex = 0) {
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