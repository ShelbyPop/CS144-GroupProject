import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  const fetchData = () => {
    fetch('http://34.19.44.124:3000/api/gameProgress/viewPlayerProgressAll')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
      })
      .then(data => setPlayers(data))
      .catch(() => setPlayers([])); 
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!players.length) return null;

  return (
    <div className="signup-container" style={{ backgroundColor: '#001f4d' }}>
      <h2 className="signup-title" style={{ color: 'lightgreen', textAlign: 'center' }}>
        Leaderboard
      </h2>
      <ul >
        {players.map(({ username, levelFinished, timePlayed }, index) => (
          <li key={username} style={{ marginBottom: '20px' }}>
     <div style={{ color: 'red', fontWeight: 'bold' }}>
{index + 1}. {username}
            </div>
   <div style={{ color: 'white' }}>Level Finished: {levelFinished}</div>
<div style={{ color: 'white' }}>
 Time Played: {Math.floor(timePlayed / 60)}m {timePlayed % 60}s
  </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
