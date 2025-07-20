// background.js

import { fetchAndStoreVideos } from './fetchAndStoreVideos.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("📦 Extension installed. Fetching YouTube videos...");
  fetchAndStoreVideos();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("🚀 Chrome startup detected. Fetching YouTube videos...");
  fetchAndStoreVideos();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchVideos") {
    fetchAndStoreVideos().then(() => sendResponse({ success: true }));
    return true; // keep message channel open for async
  }
});