import React, { useState } from 'react';
import emptyTile from '../assets/Empty-tile.png';
import pathTile from '../assets/Path-tile.png';
import placeableTile from '../assets/Placeable-tile.png';
import towerArt    from '../assets/Temp-tower-art.png';
import zombieSprite   from '../assets/Enemy-zombie.png';

export default function Grid({enemies}) {
  const COLS = 16;
  const ROWS = 10;
  const tileSize = 800 / COLS; // 50px

  // helper: (x,y) → index
  const idxOf = (x, y) => y * COLS + x;

  // define the fixed path tiles
  const pathCoords = new Set();
  for (let x = 0; x <= 3; x++) pathCoords.add(idxOf(x, 4));
  for (let x = 3; x <= 3; x++) pathCoords.add(idxOf(x, 3));
  for (let x = 5; x <= 5; x++) pathCoords.add(idxOf(x, 3));
  for (let x = 3; x <= 5; x++) pathCoords.add(idxOf(x, 2));
  for (let x = 5; x <= 7; x++) pathCoords.add(idxOf(x, 4));
  for (let x = 7; x < COLS; x++) pathCoords.add(idxOf(x, 5));

  // compute placeable neighbors
  const neighborOffsets = [
            [0,-1],  
    [-1, 0],       [1, 0],
            [0, 1],
  ];
  const placeableCoords = new Set();
  pathCoords.forEach(idx => {
    const x = idx % COLS, y = Math.floor(idx / COLS);
    neighborOffsets.forEach(([dx,dy]) => {
      const nx = x+dx, ny = y+dy;
      if (nx>=0 && nx<COLS && ny>=0 && ny<ROWS) {
        const nIdx = idxOf(nx,ny);
        if (!pathCoords.has(nIdx)) placeableCoords.add(nIdx);
      }
    });
  });

  // initial tile types: 'empty', 'path', or 'placeable'
  const initialTypes = Array(ROWS*COLS).fill('empty');
  pathCoords.forEach(i => initialTypes[i] = 'path');
  placeableCoords.forEach(i => initialTypes[i] = 'placeable');

  // add 'tower' as a new type when you place one
  const [tileTypes, setTileTypes] = useState(initialTypes);

  // click handler: only place on 'placeable'
  const handleClick = (idx) => {
    setTileTypes(prev => {
      // only change if it was placeable
      if (prev[idx] !== 'placeable') return prev;
      const next = [...prev];
      next[idx] = 'tower';
      return next;
    });
  };

  // render all tiles
  const tileElements = tileTypes.map((type, idx) => {
    const x = idx % COLS, y = Math.floor(idx / COLS);
    let src;
    switch (type) {
      case 'path':      src = pathTile;      break;
      case 'placeable': src = placeableTile; break;
      case 'tower':     src = towerArt;      break;
      default:          src = emptyTile;
    }
    return (
      <img
        key={`tile-${idx}`}
        src={src}
        className="tile"
        alt={`${type} tile`}
        onClick={() => handleClick(idx)}
        style={{
          left: x * tileSize,
          top:  y * tileSize,
          width:  tileSize,
          height: tileSize,
          cursor: type === 'placeable' ? 'pointer' : 'default',
        }}
      />
    );
  });

  // render enemies
  const enemyElements = (enemies || []).map((e, i) => (
    <img
      key={`enemy-${i}`}
      src={zombieSprite}
      className="enemy"
      alt="Zombie"
      style={{
        left: e.x * tileSize,
        top:  e.y * tileSize,
        width:  tileSize,
        height: tileSize,
      }}
    />
  ));

  return (
    <>
      {tileElements}
      {enemyElements}
    </>
  );
}
