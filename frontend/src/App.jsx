// src/App.jsx
import React from "react";
import GameCanvas from "./components/GameCanvas.jsx";

export default function App({ username }) {
  return (
    <div>
      {/* You can show the username anywhere if desired */}
      <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
        Logged in as: {username}
      </div>

      {/* The actual game canvas component */}
      <GameCanvas />
    </div>
  );
}
