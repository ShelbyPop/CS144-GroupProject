import React, { useState } from 'react';
import tileArt from '../assets/Temp-tower-art.png';
import emptyTile from '../assets/Empty-tile.png';

export default function Grid() {
  const COLS = 16;
  const ROWS = 10;
  const tileSize = 800 / COLS;      // = 50px here

  // State: an array of booleans; true = empty, false = original
  const [isEmpty, setIsEmpty] = useState(
    Array.from({ length: ROWS * COLS }, () => false)
  );

  const handleClick = (i) => {
    setIsEmpty((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  // Generate an array [0..ROWS-1], [0..COLS-1]
  const tiles = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const idx = y * COLS + x;
      tiles.push({ x, y, idx });
    }
  }

  return (
    <>
      {tiles.map(({ x, y, idx }) => (
        <img
          key={idx}
          src={isEmpty[idx] ? emptyTile : tileArt}
          className="tile"
          alt="Tile"
          onClick={() => handleClick(idx)}
          style={{
            left: x * tileSize,
            top: y * tileSize,
            width: tileSize,
            height: tileSize,
            cursor: 'pointer',
          }}
        />
      ))}
    </>
  );
}