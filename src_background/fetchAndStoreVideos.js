const YT_VIDEO_STORAGE_KEY = "scrapedVideos";
const CHANNELS_KEY = "channels";

import { fetchVideosFromChannel } from './fetchVideosFromChannel.js';

export async function fetchAndStoreVideos() {
  try {
    const result = await chrome.storage.local.get([CHANNELS_KEY]);
    const channels = result[CHANNELS_KEY];
    
    console.log("🔍 Channels found in storage:", channels);
    
    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      console.warn("❌ No channels found in storage.");
      return;
    }

    const videosByChannel = await getVideosByChannel(channels);
    console.log("🎥 Videos organized by channel:", videosByChannel);
    
    if (Object.keys(videosByChannel).length > 0) {
      await chrome.storage.local.set({ [YT_VIDEO_STORAGE_KEY]: videosByChannel });
      console.log("✅ Stored latest YouTube videos organized by channel:", videosByChannel);
    } else {
      console.warn("❌ No videos found from any channels.");
    }
  } catch (error) {
    console.error("💥 Error in fetchAndStoreVideos:", error);
  }
}

export async function getVideosByChannel(channels) {
  const videosByChannel = {};
  
  console.log(`🔄 Processing ${channels.length} channels...`);
  
  for (const channel of channels) {
    const { uploadsPlaylistId, channelLogo, channelId, handle } = channel;
    
    // Use handle as the channel name
    const channelName = handle;
    
    // Validate channel data
    if (!uploadsPlaylistId) {
      console.error(`❌ Missing uploadsPlaylistId for channel: ${channelName || 'Unknown Channel'}`);
      continue;
    }
    
    try {
      const videos = await fetchVideosFromChannel(uploadsPlaylistId, channelLogo, channelId, channelName);
      
      if (videos.length > 0) {
        videosByChannel[handle] = {
          videos1: videos
        };
      }
      
      // Add delay to avoid rate limiting between channels
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.error(`💥 Failed to fetch videos from ${channelName || 'Unknown Channel'} (${uploadsPlaylistId}):`, err);
    }
  }
  
  console.log(`🎯 Total channels with videos: ${Object.keys(videosByChannel).length}`);
  return videosByChannel;
} 