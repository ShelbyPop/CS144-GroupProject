// src/App.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import GameCanvas from "./components/GameCanvas.jsx";
import Progress from "./components/Progress.jsx"

// Flush any wave saves that failed while offline.
// Keeps items in the queue if the server is still unreachable.
async function flushPendingProgress() {
  let queue;
  try {
    queue = JSON.parse(localStorage.getItem('pendingProgress') || '[]');
  } catch {
    return;
  }
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} queued wave save(s)…`);
  const remaining = [];
  for (const item of queue) {
    try {
      const res = await fetch(
        `/api/gameProgress/updateProgress/${item.username}/${item.wave}`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) {
        // Server-side error (e.g. 500) — keep it and retry next time
        remaining.push(item);
      } else {
        console.log(`Synced queued wave ${item.wave} for ${item.username}`);
      }
    } catch {
      // Still no connectivity — keep all remaining items
      remaining.push(item);
    }
  }
  localStorage.setItem('pendingProgress', JSON.stringify(remaining));
}

export default function App({ username: propUsername, setInputUsername }) {
  const [username, setUsername] = useState(propUsername || null);
  const navigate = useNavigate();

  // Flush queued progress on mount and whenever connectivity is restored
  useEffect(() => {
    flushPendingProgress();
    window.addEventListener('online', flushPendingProgress);
    return () => window.removeEventListener('online', flushPendingProgress);
  }, []);

  useEffect(() => {
    // If no username passed in props, try to fetch from /me
    if (!propUsername) {
      if (!navigator.onLine) {
        navigate("/reconnecting");
        return;
      }
      fetch(`/api/auth/me`, {
        method: "GET",
        credentials: "include", // important to send cookie
      })
        .then(res => {
          if (!res.ok) throw new Error("Not logged in");
          return res.json();
        })
        .then(data => {
          setUsername(data.username);
          if (setInputUsername) setInputUsername(data.username); // update parent if needed
        })
        .catch(() => {
          console.error("Not authenticated, redirecting to login");
          navigate("/"); // redirect to login if not authenticated
        });
    }
  }, [propUsername]);

  if (!username) return null; // Optionally show a loading spinner

  return (
    <div>
      <div style={{ backgroundColor: "#222", padding: "12px 0" }}>
        <header className="logo-header">IRONKEEP</header>
      </div>
      <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
        Logged in as: {username}
      </div>

      <div className="canvas-leaderboard-container">
        <GameCanvas username={username} />
       <div class="progress-wrapper" style="margin-top: -280px;">
          <Progress />
        </div>
      </div>
    </div>
  );
}
