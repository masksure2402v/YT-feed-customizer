export function formatViews(views) {
  const num = parseInt(views);
  if (isNaN(num)) return "0 views";

  if (num >= 1_000_000) {
    const m = (num / 1_000_000).toFixed(1);
    return (m.endsWith(".0") ? m.slice(0, -2) : m) + "M views";
  }

  if (num >= 1_000) {
    return Math.floor(num / 1_000) + "K views";
  }

  return num + " views";
}

export function timeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);

  const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (let u of units) {
    const val = Math.floor(diff / u.seconds);
    if (val >= 1) return `${val} ${u.label}${val > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
}

export function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error("Timeout waiting for: " + selector));
    }, timeout);
  });
} 