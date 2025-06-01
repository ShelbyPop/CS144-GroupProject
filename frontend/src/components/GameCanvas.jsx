// src/components/GameCanvas.jsx
import React, { useRef, useEffect } from "react";
import { waypoints } from './Waypoints.jsx';
import { placementSelectData } from './PlacementData.jsx';

// CANVAS MUST BE 768X512 FOR MAP SIZE
const MAP_WIDTH = 24; // 24 tiles wide
const MAP_HEIGHT = 16; // 16 tiles tall
const PLACEMENT_TILE_NUM = 73; // I didn't decide this, Tiled did ask the devs, look at PlacementSelect.jsx for context
const TILE_SIZE = 32;

export default function GameCanvas() {

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d"); // ctx == "context"

    // This is GameMap resolution (24x16 map of 32x32 tiles)
    canvas.width = 768;
    canvas.height = 512;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const placementSelectData2D = [];

    // Converts placementSelectData to 2D array
    for (let i = 0; i < placementSelectData.length; i += MAP_WIDTH) {
      placementSelectData2D.push(placementSelectData.slice(i, i + MAP_WIDTH)); // slices every x tiles into a list.
    }

    class PlacementSelect {
      constructor({ position= { x:0, y:0 } } ) {
        this.position = position;
        this.size = TILE_SIZE;
        this.color = 'rgba(255, 255, 255, 0.2)';
        this.occupied = false; // prevents multiple towers ontop of each other
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size)
      }

      update(mouse) {
        this.draw();

        if (mouse.x > this.position.x && mouse.x < this.position.x + this.size &&
          mouse.y > this.position.y && mouse.y < this.position.y + this.size
        ) {
          this.color = 'rgba(255, 255, 255, 0.5)'; // highlight
        } else {
          this.color = 'rgba(255, 255, 255, 0.2)'; // default
        }
      }
    }

    class Enemy {
      constructor({ position = { x: 0, y: 0 } }) {
        this.position = position;
        this.width = 50;
        this.height = 50;
        this.waypointIdx = 0;
        // center image drawn, default is hooked to top left corner
        this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }
      }

      draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height); 
      }

      update() {
        this.draw();

        const waypoint = waypoints[this.waypointIdx]; // use waypoints algorithm to determine enemy pathing
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);
        // Angle determines velocity.
        this.position.x += Math.cos(angle);
        this.position.y += Math.sin(angle);
        this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }

        // Use Math.round simply for easier debugging
        if (Math.round(this.center.x) == waypoint.x &&
          Math.round(this.center.y) == waypoint.y &&
          this.waypointIdx < waypoints.length - 1) 
          {
          this.waypointIdx++;
        }
      }
    }

    class Tower {
      constructor( {position = { x:0, y:0 } } ) {
        this.position = position;
        this.width = TILE_SIZE * 2;
        this.height = TILE_SIZE * 2;
      }

      draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
      }
    }

    const placementTiles = []
 
    placementSelectData2D.forEach((row, y) => {
      row.forEach((num, x) => {
        if (num === PLACEMENT_TILE_NUM) {
          // add tower placement tile
          placementTiles.push(new PlacementSelect({
            position: {
              x: x * TILE_SIZE,
              y: y * TILE_SIZE
            }
          }))
        }
      })
    })

    const image = new Image();
    image.onload = () => {
      animate();
    }
    image.src = 'assets/GameMap.png';

    const enemies = []
    for (let i = 1; i < 10; i++) {
      const xOffset = i * 150;
      enemies.push(new Enemy({
        position: {x : waypoints[0].x - xOffset, y: waypoints[0].y}
      }));
    }

    let currTile = undefined;
    const towers = [];
    
    // ===========  BELOW THIS LINE IS ANIMATION =========== //

    function animate() {
      requestAnimationFrame(animate);

      ctx.drawImage(image, 0 , 0); // draws game canvas 
      enemies.forEach(enemy => {
        enemy.update();
      });

      placementTiles.forEach(tile => {
        tile.update(mouse);
      })

      towers.forEach(tower => {
        tower.draw();
      })
    }

    const mouse = {
      x: undefined,
      y: undefined
    };
    // THIS FUNCTION RECALCULATES WINDOW X/Y TO CANVAS WIDTH/HEIGHT
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();

      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      mouse.x = (rawX * (canvas.width  / rect.width));
      mouse.y = (rawY * (canvas.height / rect.height));

      currTile = null;
      for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size &&
          mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size) 
          {
            currTile = tile;
            break;
          }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    canvas.addEventListener('click', (event) => {
      if (currTile && !currTile.occupied) {
        towers.push(
          new Tower({
            position: {
              x: currTile.position.x,
              y: currTile.position.y
            }
        }));
        currTile.occupied = true;
      }
      //console.log(towers);
    });
  }, []);


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: "pixelated", // crisp scaling for pixel art
        }}
      />
    </div>
  );
}
