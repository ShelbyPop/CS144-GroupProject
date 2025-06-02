// src/components/GameCanvas.jsx
import React, { useRef, useEffect, useState } from "react";
import { waypoints } from './Waypoints.jsx';
import { placementSelectData } from './PlacementData.jsx';
import { findArrowIndex } from './ArrowAngles.jsx';

// CANVAS MUST BE 768X512 FOR MAP SIZE
const MAP_WIDTH = 24; // 24 tiles wide
const MAP_HEIGHT = 16; // 16 tiles tall
const PLACEMENT_TILE_NUM = 73; // I didn't decide this, Tiled did ask the devs, look at PlacementSelect.jsx for context
const TILE_SIZE = 32;
const ENEMY_MAX_HEALTH = 50;
const TOWER_DAMAGE = 10 ;
const USER_MAX_HEALTH = 10;
const USER_START_COINS = 100;
const TOWER_COST = 50;
const ENEMY_BOUNTY = 10;

export default function GameCanvas() {

  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [userHealth, setUserHealth] = useState(USER_MAX_HEALTH);
  const [userCoins, setUserCoins] = useState(USER_START_COINS);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d"); // ctx == "context"

    // This is GameMap resolution (24x16 map of 32x32 tiles)
    canvas.width = 768;
    canvas.height = 512;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.onload = () => {
      animate();
    }
    image.src = 'assets/GameMap.png';

    const arrowImages = [];
    // asset guy named them backwards imo, so pushing 0 deg to 90 degrees order.
    for (let i = 13; i >= 2; i--) {
      const img = new Image();
      img.src = `assets/Arrow/${i}.png`;
      arrowImages.push(img);
    }

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
        };
        this.radius = 25;
        this.health = 50;
        this.velocity = {
          x: 0,
          y: 0
        }
      }

      draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // health
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y-10, this.width, 7)
        ctx.fillStyle = 'green';
        ctx.fillRect(this.position.x, this.position.y-10, this.width * this.health / 50 , 7)

      }

      update() {
        this.draw();

        const waypoint = waypoints[this.waypointIdx]; // use waypoints algorithm to determine enemy pathing
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);
        // Angle determines velocity.
        const speedAmp = 0.6; // speed amplifier, default 1
        this.velocity.x = Math.cos(angle) * speedAmp;
        this.velocity.y = Math.sin(angle) * speedAmp;
        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y 
        this.center = {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2
        }

        // Use Math.round for easier debug
        // Since can speed up enemies, must clamp position to waypoint within amplitude adjustment
        if (
          Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x)  &&
          Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y) &&
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
        this.center = {
          x: this.position.x + this.width/2,
          y: this.position.y + this.height/2
        };
        this.projectiles = [];
        this.radius = 150;
        this.target; // decide later in range detection
        this.frameCount = 0;
      }

      draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'
        ctx.fill()
      }

      update() {
        this.draw();
        if (this.frameCount % 150 === 0 && this.target) {
          this.projectiles.push(
            new Projectile({
            position: {
              x: this.center.x,
              y: this.center.y
            },
            enemy: this.target
            })
          )
        }
        this.frameCount++; // increase timer
        this.angle = 0; // angle to determine which arrow we draw.
      }
    }

    class Projectile {
      constructor( { position = { x:0, y:0 }, enemy }) {
        this.position = position;
        this.velocity = {
          x: 0,
          y: 0
        };
        this.enemy = enemy;
        this.radius = 5;

        // this.image = new Image();
        // this.image.src = 'assets/Arrow/13.png';
      }

      draw() {
        // 1) Find which of the 12 “0°→90° bins” this.angle falls into, and how much to rotate:
        const { index, rotation } = findArrowIndex(this.angle);

        // 2) Grab that preloaded Image object:
        const img = arrowImages[index];
        if (!img) return; // DO NOT REMOVE THIS LINE.

        // 3) Compute width/height so we can center the draw:
        const w = img.width;
        const h = img.height;


        // 4) Translate to projectile‐center, rotate, then draw the arrow centered:
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(rotation);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }

      update() {
        this.draw();
        this.angle = Math.atan2(this.enemy.center.y - this.position.y, 
          this.enemy.center.x - this.position.x); // grab angle to travel towards enemy
        //console.log(this.angle);
        const speedAmp = 1.8; // speed amplifier to make faster than enemy
        this.velocity.x = Math.cos(this.angle) * speedAmp; 
        this.velocity.y = Math.sin(this.angle) * speedAmp;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        //console.log(this.angle);
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

    

    const enemies = []
    
    // wave spawn functionality
    function spawnWave(enemyCount) {
      for (let i = 1; i < enemyCount+1; i++) {
        const xOffset = i * 75;
        enemies.push(new Enemy({
          position: {x : waypoints[0].x - xOffset, y: waypoints[0].y}
        }));
      }
    }
    

    let currTile = undefined;
    const towers = [];
    let numEnemies = 3;
    spawnWave(numEnemies);
    // ===========  ANIMATION =========== //

    function animate() {
      const animationId = requestAnimationFrame(animate);

      ctx.drawImage(image, 0 , 0); // draws game canvas 
      // loop from back, since later splicing can cause rendering bug
      for (let i = enemies.length - 1; i >=0; i--) {
        const enemy = enemies[i];
        enemy.update();
        if (enemy.position.x > canvas.width) {
          // DON'T CLAMP DAMAGE TAKEN. If we clamp, may keep triggering game over on every enemy exit (Likely not wanted)
          setUserHealth((prev) => {
            const newHealth = prev - 1;
            if (newHealth <= 0) {
              setGameOver(true);
              cancelAnimationFrame(animationId);
            }
            return newHealth;
          });
          enemies.splice(i, 1); //splice after taking damage
        }
      }

      // track total amt enemies
      if (enemies.length === 0) {
        numEnemies += 2;
        spawnWave(numEnemies);
      }

      placementTiles.forEach(tile => {
        tile.update(mouse);
      })

      towers.forEach(tower => {
        tower.update();
        tower.target = null;
        const possibleTargets = enemies.filter(enemy => {
          const xOffset = enemy.center.x  - tower.center.x;
          const yOffset = enemy.center.y  - tower.center.y
          const dist = Math.hypot(xOffset, yOffset);
          return (dist < enemy.radius + tower.radius);
        })
        tower.target = possibleTargets[0]; // very common to set targeting to front most enemy in range.
        // console.log(possibleTargets);
      });

      // WE SPLIT THESE UP SO THE PROJECTILES DRAW ONTOP OF THE TOWER, ALWAYS.
      towers.forEach(tower => {
        for (let i = tower.projectiles.length - 1; i >= 0; i--) {
          const projectile = tower.projectiles[i];
          projectile.update()

          // collision detection between enemy and projectile
          const xOffset = projectile.enemy.center.x  - projectile.position.x;
          const yOffset = projectile.enemy.center.y  - projectile.position.y
          const dist = Math.hypot(xOffset, yOffset);
          // when projectile hits enemy:
          if (dist < projectile.enemy.radius + projectile.radius) { 
            projectile.enemy.health -= TOWER_DAMAGE;
            if (projectile.enemy.health <= 0) {
              const enemyIdx = enemies.findIndex((enemy) => {
                return projectile.enemy === enemy;
              })
              // clamp index find if not found.
              if (enemyIdx > -1) {
                enemies.splice(enemyIdx, 1); // splice on killing enemy
                setUserCoins(prevCoins => prevCoins + ENEMY_BOUNTY);
              } 
              
            }

            // console.log(projectile.enemy.health);
            tower.projectiles.splice(i, 1)
          }
          // console.log(dist);
          
        }
      });

      
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
        setUserCoins(prevCoins => {
          if (prevCoins >= TOWER_COST) {
            towers.push(
              new Tower({
                position: {
                  x: currTile.position.x,
                  y: currTile.position.y
                }
              })
            );
            currTile.occupied = true;
            return prevCoins - TOWER_COST;
          }
          return prevCoins; // don't change if not enough coins
        });
      }
    });

  }, []); 


  // GameCanvas html styling
  return (
    // center canvas-container in window
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
      <div
        className="canvas-container"
        style={{
          position: "relative",
          width: "768px",
          height: "512px",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
            display: "block",
          }}
        />

        
        <div className="health-overlay">
          {/* Coin SVG from SVGREPO */}
          <svg 
            fill="none" 
            height="20px" 
            width="20px" 
            version="1.1" 
            id="Capa_1" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlns:xlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 489.9 489.9" 
            xml:space="preserve">
            <g id="SVGRepo_iconCarrier">
              <g>
                <g>
                  <path 
                    d="M183.85,216.3c33.8-43.1,86.3-70.8,145.4-70.8c8.8,0,17.5,0.6,26.1,1.8v-39.4c-26.7,24-95.9,41.1-177.2,41.1c-80.8,0-149.8-16.9-176.8-40.8l0,50.7C14.85,214.2,181.95,216.4,183.85,216.3z"
                    fill="gold"
                    stroke="black"
                    stroke-width="2"/>
                  <path 
                    d="M1.25,198.5L1.15,250c6.5,28.6,66.8,51.8,144.9,56.9c3-24.3,10.8-47.2,22.4-67.6C91.75,238,27.05,221.5,1.25,198.5z"
                    fill="gold"
                    stroke="black"
                    stroke-width="2"/>
                  <path 
                    d="M1.15,290l-0.1,49c0.3-0.3,0.6-0.6,0.9-0.8c1.9,31.6,69.4,57.5,156.1,61.2c-8.7-21.4-13.4-44.7-13.4-69.2v-0.1C78.45,326,24.15,310.6,1.15,290z"
                    fill="gold"
                    stroke="black"
                    stroke-width="2"/>
                  <path 
                    d="M169.55,422.7c-78.2-1.3-143.9-18.6-168.5-42.2l-0.1,46.2c0,34.8,79.3,63,177.2,63c18.7,0,36.7-1,53.6-2.9C206.15,470.8,184.75,448.8,169.55,422.7z"
                    fill="gold"
                    stroke="black"
                    stroke-width="2"/>
                  <ellipse 
                    cx="178.15" 
                    cy="62.9" 
                    rx="177.4" 
                    ry="62.9" 
                    fill="gold"
                    stroke="black"
                    stroke-width="2"/>
                  <path 
                    d="M329.25,170.2c-88.3,0-159.9,71.6-159.9,159.9s71.6,159.8,159.9,159.8s159.9-71.6,159.9-159.9S417.55,170.2,329.25,170.2z M343.85,415.4v10.1c0,8.1-6.5,14.6-14.6,14.6s-14.6-6.5-14.6-14.6v-10.1c-8.5-2.6-16.4-7.3-22.6-13.9c-5.5-5.9-5.2-15.1,0.6-20.6 c5.9-5.5,14.8-4.9,20.6,0.6c6.4,6.1,17,6.8,17.5,6.8c11.3-0.8,20.3-10.3,20.3-21.8c0-12-9.8-21.9-21.8-21.9c-28.1,0-51-22.9-51-51 c0-23.1,15.4-42.6,36.4-48.9v-10.1c0-8.1,6.5-14.6,14.6-14.6s14.6,6.5,14.6,14.6v10.1c8.5,2.6,16.4,7.3,22.6,13.9 c5.5,5.9,5.2,15.1-0.6,20.6c-5.9,5.5-15.6,5.7-20.6-0.6c-5.3-6.7-17-6.8-17.5-6.8c-11.3,0.8-20.3,10.3-20.3,21.8 c0,12,9.8,21.9,21.8,21.9c28.1,0,51,22.9,51,51C380.25,389.6,364.85,409.1,343.85,415.4z"
                    fill="gold"
                    stroke="black"
                    stroke-width="2"/>
                </g>
              </g>
            </g>
          </svg>

          <span className="coin-text">{userCoins}</span>

          {/* Heart SVG from HEROICONS.COM */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="black"
            strokeWidth="1"
            className="heart-icon"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          <span className="health-text">{userHealth}</span>
        </div>

        {/* ④ Game-over overlay (shown only when gameOver is true) */}
        {gameOver && (
          <div className="game-over-overlay">
            <span className="game-over-text">Game Over</span>
          </div>
        )}
      </div>
    </div>
  );
}
