import React, { useState, useEffect, useRef } from 'react';
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
  // (x,y) or (col, row) 0-indexed tuples
  for (let x = 0; x <= 3; x++) pathCoords.add(idxOf(x, 4));
  pathCoords.add(idxOf(3, 3));
  for (let x = 3; x <= 4; x++) pathCoords.add(idxOf(x, 2)); 
  for (let y = 2; y <= 7; y++) pathCoords.add(idxOf(5, y));
  
  for (let x = 5; x <= 6; x++) pathCoords.add(idxOf(x, 7));
  for (let y = 5; y <= 7; y++) pathCoords.add(idxOf(7, y));

  for (let y = 2; y <= 3; y++) pathCoords.add(idxOf(7, y));
  
  for (let x = 7; x <= 8; x++) pathCoords.add(idxOf(x, 5));
  for (let y = 3; y <= 5; y++) pathCoords.add(idxOf(9, y));
  pathCoords.add(idxOf(8, 3));
  for (let x = 7; x <= 11; x++) pathCoords.add(idxOf(x, 1));
  for (let y = 2; y <= 5; y++) pathCoords.add(idxOf(11, y));

  for (let x = 12; x < COLS; x++) pathCoords.add(idxOf(x, 5));



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

  // enemy animation
  const [zombies, setZombies] = useState([]);
  const animationRef = useRef(null); // prevents multiple starts

  useEffect(() => {
    if (!enemies || enemies.length === 0) return;

    // on spawn: move right 3 tiles, up 2, right 2, down 5, right 2, up 2, right 2, up 2, left 2, up 2, right 4, down 4, right 4

    const { x: startX, y: startY } = enemies[0];
    
    const segments = [
      { sx: startX, sy: startY, ex: startX + 3, ey: startY },        // right 3
      { sx: startX + 3, sy: startY, ex: startX + 3, ey: startY - 2 },// up 2
      { sx: startX + 3, sy: startY - 2, ex: startX + 5, ey: startY - 2 }, // right 2
      { sx: startX + 5, sy: startY - 2, ex: startX + 5, ey: startY + 3 }, // down 5
      { sx: startX + 5, sy: startY + 3, ex: startX + 7, ey: startY + 3 }, // right 2
      { sx: startX + 7, sy: startY + 3, ex: startX + 7, ey: startY + 1 }, // up 2
      { sx: startX + 7, sy: startY + 1, ex: startX + 9, ey: startY + 1 }, // right 2
      { sx: startX + 9, sy: startY + 1, ex: startX + 9, ey: startY - 1 }, // up 2
      { sx: startX + 9, sy: startY - 1, ex: startX + 7, ey: startY - 1 }, // left 2
      { sx: startX + 7, sy: startY - 1, ex: startX + 7, ey: startY - 3 }, // up 2
      { sx: startX + 7, sy: startY - 3, ex: startX + 11, ey: startY - 3 }, // right 4
      { sx: startX + 11, sy: startY - 3, ex: startX + 11, ey: startY + 1 }, // down 4
      { sx: startX + 11, sy: startY + 1, ex: startX + 15, ey: startY + 1 }, // right 4
    ];
    const tileTravelTime = 300;              // ms per tile
    let segmentIdx = 0;
    let t0 = null;
    let segmentDuration = null;

    const step = now => {
      if (t0 === null) {
        t0 = now;
        const { sx, sy, ex, ey } = segments[segmentIdx];
        const dx = Math.abs(ex - sx);
        const dy = Math.abs(ey - sy);
        const tiles = dx + dy;
        segmentDuration = tileTravelTime * tiles;
      }

      const t = Math.min((now - t0) / segmentDuration, 1);
      const { sx, sy, ex, ey } = segments[segmentIdx];
      const currX = sx + (ex - sx) * t;
      const currY = sy + (ey - sy) * t;
      setZombies([{ x: currX, y: currY }]);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else if (segmentIdx < segments.length - 1) {
        segmentIdx += 1;
        t0 = null;
        animationRef.current = requestAnimationFrame(step);
      }
    };


    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, [enemies]);

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
  const enemyElements = zombies.map((z, i) => (
    <img
      key={`zombie-${i}`}
      src={zombieSprite}
      className="enemy"
      alt="Zombie"
      style={{
        left:   z.x * tileSize,
        top:    z.y * tileSize,
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
