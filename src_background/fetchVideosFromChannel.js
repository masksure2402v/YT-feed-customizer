const API_KEY = import.meta.env.VITE_YT_API_KEY;

export async function fetchVideosFromChannel(uploadsPlaylistId, channelLogo, channelId, channelName) {
  const targetVideoCount = 10; // Target number of regular videos to collect
  const maxResultsPerCall = 50; // Maximum videos per API call
  const allVideos = [];
  let nextPageToken = null;
  let totalSkippedShorts = 0;
  let totalApiCalls = 0;
  
  console.log(`🔄 Fetching videos from channel: ${channelName || 'Unknown Channel'} (Target: ${targetVideoCount} videos)`);
  
  try {
    do {
      totalApiCalls++;
      
      // Build URL with pagination
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResultsPerCall}&key=${API_KEY}`;
      if (nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
      }
      
      console.log(`🔄 API Call ${totalApiCalls} for ${channelName || 'Unknown Channel'}${nextPageToken ? ` (Page: ${nextPageToken})` : ''}`);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Check for API errors
      if (data.error) {
        throw new Error(`YouTube API Error: ${data.error.message} (Code: ${data.error.code})`);
      }
      
      console.log(`📊 API response ${totalApiCalls} for ${channelName || 'Unknown Channel'}:`, {
        itemsCount: data.items?.length || 0,
        pageInfo: data.pageInfo,
        nextPageToken: data.nextPageToken
      });

      if (!data.items || data.items.length === 0) {
        console.log(`⚠️ No more videos found for channel: ${channelName || 'Unknown Channel'}`);
        break;
      }

      const videoIds = data.items.map(item => item.snippet?.resourceId?.videoId).filter(Boolean);
      if (!videoIds.length) {
        console.warn(`⚠️ No valid video IDs found in this batch for channel: ${channelName || 'Unknown Channel'}`);
        nextPageToken = data.nextPageToken;
        continue;
      }

      console.log(`🎬 Video IDs in batch ${totalApiCalls} for ${channelName || 'Unknown Channel'}:`, videoIds.length);

      // Fetch video statistics for this batch
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${API_KEY}`;
      const statsRes = await fetch(statsUrl);
      
      if (!statsRes.ok) {
        throw new Error(`Statistics API HTTP ${statsRes.status}: ${statsRes.statusText}`);
      }
      
      const statsData = await statsRes.json();
      
      if (statsData.error) {
        throw new Error(`Statistics API Error: ${statsData.error.message}`);
      }

      const statsMap = {};
      for (const video of statsData.items || []) {
        statsMap[video.id] = {
          views: video.statistics?.viewCount || "0"
        };
      }

      let skippedShortsInBatch = 0;
      let processedVideosInBatch = 0;

      // Process videos in this batch
      const videoPromises = data.items.map(async item => {
        const snippet = item.snippet;
        const videoId = snippet?.resourceId?.videoId;
        if (!videoId) return null;

        const isShort = await detectIfShort(videoId);
        if (isShort) {
          skippedShortsInBatch++;
          console.log(`🩳 Skipped Short: ${snippet.title}`);
          return null;
        }

        processedVideosInBatch++;
        return {
          videoId,
          title: snippet.title,
          published: snippet.publishedAt,
          thumbnail: snippet.thumbnails?.high?.url,
          channelId,
          channelName,
          views: Number(statsMap[videoId]?.views || 0),
          channelLogo
        };
      });

      const resolvedVideos = await Promise.all(videoPromises);
      const filteredVideos = resolvedVideos.filter(Boolean);
      
      // Add valid videos to our collection
      allVideos.push(...filteredVideos);
      totalSkippedShorts += skippedShortsInBatch;
      
      console.log(`📊 Batch ${totalApiCalls} results for ${channelName || 'Unknown Channel'}: ${filteredVideos.length} videos added, ${skippedShortsInBatch} shorts skipped. Total collected: ${allVideos.length}/${targetVideoCount}`);
      
      // Check if we have enough videos or if there's a next page
      nextPageToken = data.nextPageToken;
      
      // Break if we have enough videos or no more pages
      if (allVideos.length >= targetVideoCount || !nextPageToken) {
        break;
      }
      
      // Add delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } while (nextPageToken && allVideos.length < targetVideoCount);

    // Take only the target number of videos (10)
    const finalVideos = allVideos.slice(0, targetVideoCount);

    console.log(`✅ Finished processing ${channelName || 'Unknown Channel'}: ${finalVideos.length} videos stored, ${totalSkippedShorts} shorts skipped across ${totalApiCalls} API calls`);
    
    if (finalVideos.length === 0 && totalSkippedShorts > 0) {
      console.warn(`⚠️ Channel '${channelName || 'Unknown Channel'}' has only Shorts — skipped all ${totalSkippedShorts} videos.`);
    }

    return finalVideos;

  } catch (error) {
    console.error(`💥 Error fetching videos from ${channelName || 'Unknown Channel'}:`, error);
    
    // Log more details about the error
    if (error.message.includes('403')) {
      console.error('🚫 API Key might be invalid or quota exceeded');
    } else if (error.message.includes('404')) {
      console.error('🔍 Playlist not found - check uploadsPlaylistId');
    }
    
    return [];
  }
}

export async function detectIfShort(videoId) {
  try {
    console.log(`🔍 Checking if ${videoId} is a Short...`);
    
    // Try to fetch the shorts URL
    const shortsResponse = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: 'HEAD',
      redirect: 'follow' // Follow redirects
    });
    
    console.log(`📍 Shorts URL check for ${videoId}: status=${shortsResponse.status}, finalUrl=${shortsResponse.url}`);
    
    // If the final URL after following redirects still contains 'shorts', it's a Short
    if (shortsResponse.ok && shortsResponse.url && shortsResponse.url.includes('/shorts/')) {
      console.log(`✅ ${videoId} is a Short (final URL contains /shorts/)`);
      return true;
    }
    
    // If the final URL redirects to /watch?v=, it's NOT a Short
    if (shortsResponse.ok && shortsResponse.url && shortsResponse.url.includes('/watch?v=')) {
      console.log(`❌ ${videoId} is NOT a Short (redirected to /watch?v=)`);
      return false;
    }
    
    // If we get 404 or other error on shorts URL, it's likely not a short
    if (shortsResponse.status === 404) {
      console.log(`❌ ${videoId} is NOT a Short (shorts URL returned 404)`);
      return false;
    }
    
    console.log(`❓ ${videoId} - unclear result, defaulting to NOT a Short`);
    return false;
    
  } catch (error) {
    console.warn(`⚠️ Failed to detect short status for ${videoId}:`, error.message);
    return false; // fallback: treat as normal video
  }
} 