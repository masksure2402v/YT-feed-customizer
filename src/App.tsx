import { useEffect, useState } from 'react';
import './App.css';

interface Channel {
  handle: string;
  channelId: string;
  uploadsPlaylistId: string;
  channelLogo: string;
}

const API_KEY = import.meta.env.VITE_YT_API_KEY;

async function getChannelInfoFromHandle(handle: string) {
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&forHandle=${encodeURIComponent(cleanHandle)}&key=${API_KEY}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();
  if (!channelData.items || channelData.items.length === 0) {
    throw new Error('Channel not found.');
  }
  const channelId = channelData.items[0].id;
  const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
  const channelLogo = channelData.items[0].snippet?.thumbnails?.high?.url;
  if (!uploadsPlaylistId || !channelLogo) {
    throw new Error('Could not get all required data for channel.');
  }
  return { channelId, uploadsPlaylistId, channelLogo };
}

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelInput, setChannelInput] = useState('');
  const [frequency, setFrequency] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.chrome?.storage?.local) {
      window.chrome.storage.local.get(['channels'], (result) => {
        setChannels(result.channels || []);
      });
      window.chrome.storage.local.get(['videoFrequency'], (result) => {
        setFrequency(result.videoFrequency || 5);
      });
    }
  }, []);

  const saveFrequency = (freq: number) => {
    setFrequency(freq);
    if (window.chrome?.storage?.local) {
      window.chrome.storage.local.set({ videoFrequency: freq });
    }
  };

  const handleAddChannel = async () => {
    if (!channelInput.startsWith('@')) {
      alert("Handle must start with '@'");
      return;
    }
    setLoading(true);
    try {
      const { channelId, uploadsPlaylistId, channelLogo } = await getChannelInfoFromHandle(channelInput);
      if (channels.some((ch) => ch.channelId === channelId)) {
        alert('Channel already added.');
        setLoading(false);
        return;
      }
      const newChannels = [...channels, { handle: channelInput, channelId, uploadsPlaylistId, channelLogo }];
      setChannels(newChannels);
      setChannelInput('');
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.set({ channels: newChannels });
      }
      alert(`Channel saved! ${channelInput}`);
    } catch (err) {
      console.error(err);
      alert('Could not fetch channel info. Make sure the handle is valid.');
    }
    setLoading(false);
  };

  const handleDeleteChannel = (index: number) => {
    const deleted = channels[index];
    const newChannels = channels.filter((_, i) => i !== index);
    setChannels(newChannels);
    if (window.chrome?.storage?.local) {
      window.chrome.storage.local.set({ channels: newChannels });
    }
    alert(`Deleted ${deleted.handle}`);
  };

  return (
    <div className="popup-body">
      <div className="input-section">
        <input
          className="channel-input"
          value={channelInput}
          onChange={e => setChannelInput(e.target.value)}
          placeholder="@channelName"
          disabled={loading}
        />
        <button
          className="add-channel-btn"
          onClick={handleAddChannel}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Channel'}
        </button>
      </div>
      <div className="frequency-section">
        <div className="frequency-header">
          <span className="frequency-label">Frequency of videos</span>
          <span className="frequency-value">{frequency}</span>
        </div>
        <div className="frequency-controls">
          <button
            className="frequency-btn"
            onClick={() => frequency > 1 && saveFrequency(frequency - 1)}
            disabled={frequency <= 1}
          >
            -
          </button>
          <input
            type="range"
            className="frequency-slider"
            min={1}
            max={20}
            value={frequency}
            onChange={e => saveFrequency(Number(e.target.value))}
          />
          <button
            className="frequency-btn"
            onClick={() => frequency < 20 && saveFrequency(frequency + 1)}
            disabled={frequency >= 20}
          >
            +
          </button>
        </div>
        <div className="frequency-info">Videos per channel to inject (1-20)</div>
      </div>
      <div className="channels-list">
        {channels.length === 0 ? (
          <div className="no-channels">No channels added yet</div>
        ) : (
          channels.map((channel, idx) => (
            <div className="channel-item" key={channel.channelId}>
              <div className="channel-info">
                <img
                  src={channel.channelLogo}
                  alt={channel.handle}
                  className="channel-thumbnail"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <span className="channel-handle">{channel.handle}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteChannel(idx)}
              >
                Delete 
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
