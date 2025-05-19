import React, { useState } from 'react';
import './App.css'
import Grid from './components/Grid';

function App() {
  const [started, setStarted] = useState(false);
  const [waveStarted, setWaveStarted] = useState(false);
  const [enemies, setEnemies] = useState([]);

  const handleStart = () => {
    setStarted(true);
  };

  const handleBeginWave = () => {
    setWaveStarted(true);
    // spawn one zombie at col=0,row=4
    setEnemies([{ x: 0, y: 4 }]);
  };


  return (
    <div className="viewport">
      {/* Start button + overlay */}
      {!started && (
        <div className="viewport-overlay">
          <div className="hud-button" onClick={handleStart}>
            START GAME
          </div>
        </div>
      )}

       {/* Begin Wave button, available once started */}
      {started && !waveStarted && (
        <div className="begin-wave-button" onClick={handleBeginWave}>
          Begin Wave
        </div>
      )}

      {/* grid + any spawned enemies */}
      <Grid enemies={enemies} />
    </div>
  );
}

export default App;
