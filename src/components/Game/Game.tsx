"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  GameState,
  Player,
  Monster,
  Boss,
  Bullet,
  MAP_WIDTH,
  MAP_HEIGHT,
} from "./types";
import GameOverPopup from "./GameOverPopup";
import Leaderboard from "./Leaderboard";
import Header from "../Header";

interface GameProps {
  contractAddress?: string;
}

const Game: React.FC<GameProps> = ({ contractAddress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [tweetSent, setTweetSent] = useState(false);
  const [tweetContent, setTweetContent] = useState<string | null>(null);
  const gameStateRef = useRef<GameState>({
    player: {
      x: MAP_WIDTH / 2,
      y: MAP_HEIGHT / 2,
      width: 32,
      height: 32,
      speed: 6,
      bullets: [],
      lives: 10,
    },
    camera: {
      x: 0,
      y: 0,
    },
    monsters: [],
    boss: null,
    score: 0,
    keys: {},
    isGameOver: false,
    bossDefeated: false,
    isPaused: false, // Thêm trạng thái tạm dừng game
  });

  // Pixel art helper functions
  const drawPixel = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  };

  const drawPixelBackground = (ctx: CanvasRenderingContext2D) => {
    // Set dark background
    ctx.fillStyle = "#0c0b1d";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const { camera } = gameStateRef.current;

    // Draw fixed stars with various colors and sizes
    const starColors = ["#ffffff", "#bc4a9b", "#24e5ff", "#ffeb65"];
    const starSizes = [2, 4, 6, 8];

    // Use a deterministic pattern based on grid position
    for (
      let worldX = Math.floor(camera.x / 50) * 50;
      worldX < camera.x + ctx.canvas.width + 50;
      worldX += 50
    ) {
      for (
        let worldY = Math.floor(camera.y / 50) * 50;
        worldY < camera.y + ctx.canvas.height + 50;
        worldY += 50
      ) {
        // Use position to generate consistent random values
        const hash = Math.sin(worldX * 12.9898 + worldY * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        if (rand < 0.4) {
          // Increase star density
          const screenX = worldX - camera.x;
          const screenY = worldY - camera.y;
          const colorIndex = Math.floor(rand * starColors.length);
          const sizeIndex = Math.floor(rand * starSizes.length);

          // Draw star
          ctx.fillStyle = starColors[colorIndex];
          const size = starSizes[sizeIndex];
          ctx.fillRect(screenX, screenY, size, size);

          // Add glow effect
          if (size > 1) {
            ctx.fillStyle = `${starColors[colorIndex]}33`;
            ctx.fillRect(screenX - 1, screenY - 1, size + 2, size + 2);

            // Add extra glow for larger stars
            if (size > 2) {
              ctx.fillStyle = `${starColors[colorIndex]}22`;
              ctx.fillRect(screenX - 2, screenY - 2, size + 4, size + 4);
            }
          }

          // Randomly add cross-shaped sparkles
          if (rand > 0.8 && size > 2) {
            ctx.fillStyle = starColors[colorIndex];
            ctx.fillRect(screenX - 2, screenY, 1, 1);
            ctx.fillRect(screenX + size + 1, screenY, 1, 1);
            ctx.fillRect(screenX, screenY - 2, 1, 1);
            ctx.fillRect(screenX, screenY + size + 1, 1, 1);
          }
        }
      }
    }
  };

  const drawPixelPlayer = (ctx: CanvasRenderingContext2D) => {
    const { player, camera } = gameStateRef.current;
    const playerX = Math.floor(player.x - camera.x - player.width / 2);
    const playerY = Math.floor(player.y - camera.y - player.height / 2);
    const pixelSize = 5;

    // Colors for the green alien monster
    const colors = {
      outline: "#000000", // Black outline
      bodyDark: "#4B2D83", // Dark purple for outer body
      bodyLight: "#6B3FA3", // Lighter purple for body highlights
      eyeWhite: "#FFFFFF", // White for eye
      eyePupil: "#000000", // Black pupil
      tentacles: "#33AA33", // Green tentacles
      tentacleLight: "#88FF00", // Light green for tentacle highlights
      bodyGreen: "#55DD00", // Bright green for body
    };

    // Draw alien monster pixel by pixel
    const playerPixels = [
      // Outer outline - top and sides
      { x: 2, y: 0, color: colors.outline },
      { x: 3, y: 0, color: colors.outline },
      { x: 4, y: 0, color: colors.outline },
      { x: 5, y: 0, color: colors.outline },
      { x: 6, y: 0, color: colors.outline },
      { x: 1, y: 1, color: colors.outline },
      { x: 7, y: 1, color: colors.outline },
      { x: 0, y: 2, color: colors.outline },
      { x: 8, y: 2, color: colors.outline },
      { x: 0, y: 3, color: colors.outline },
      { x: 8, y: 3, color: colors.outline },
      { x: 0, y: 4, color: colors.outline },
      { x: 8, y: 4, color: colors.outline },
      { x: 0, y: 5, color: colors.outline },
      { x: 8, y: 5, color: colors.outline },
      { x: 1, y: 6, color: colors.outline },
      { x: 7, y: 6, color: colors.outline },

      // Tentacle outlines
      { x: 1, y: 7, color: colors.outline },
      { x: 3, y: 7, color: colors.outline },
      { x: 5, y: 7, color: colors.outline },
      { x: 7, y: 7, color: colors.outline },
      { x: 0, y: 8, color: colors.outline },
      { x: 2, y: 8, color: colors.outline },
      { x: 4, y: 8, color: colors.outline },
      { x: 6, y: 8, color: colors.outline },
      { x: 8, y: 8, color: colors.outline },

      // Body - dark purple outer part
      { x: 2, y: 1, color: colors.bodyDark },
      { x: 3, y: 1, color: colors.bodyDark },
      { x: 4, y: 1, color: colors.bodyDark },
      { x: 5, y: 1, color: colors.bodyDark },
      { x: 6, y: 1, color: colors.bodyDark },
      { x: 1, y: 2, color: colors.bodyDark },
      { x: 2, y: 2, color: colors.bodyDark },
      { x: 6, y: 2, color: colors.bodyDark },
      { x: 7, y: 2, color: colors.bodyDark },
      { x: 1, y: 3, color: colors.bodyDark },
      { x: 7, y: 3, color: colors.bodyDark },
      { x: 1, y: 4, color: colors.bodyDark },
      { x: 7, y: 4, color: colors.bodyDark },
      { x: 1, y: 5, color: colors.bodyDark },
      { x: 2, y: 5, color: colors.bodyDark },
      { x: 6, y: 5, color: colors.bodyDark },
      { x: 7, y: 5, color: colors.bodyDark },
      { x: 2, y: 6, color: colors.bodyDark },
      { x: 3, y: 6, color: colors.bodyDark },
      { x: 4, y: 6, color: colors.bodyDark },
      { x: 5, y: 6, color: colors.bodyDark },
      { x: 6, y: 6, color: colors.bodyDark },

      // Body - light purple highlights
      { x: 2, y: 2, color: colors.bodyLight },
      { x: 6, y: 2, color: colors.bodyLight },
      { x: 2, y: 5, color: colors.bodyLight },
      { x: 6, y: 5, color: colors.bodyLight },

      // Body - green center
      { x: 3, y: 2, color: colors.bodyGreen },
      { x: 4, y: 2, color: colors.bodyGreen },
      { x: 5, y: 2, color: colors.bodyGreen },
      { x: 2, y: 3, color: colors.bodyGreen },
      { x: 3, y: 3, color: colors.bodyGreen },
      { x: 5, y: 3, color: colors.bodyGreen },
      { x: 6, y: 3, color: colors.bodyGreen },
      { x: 2, y: 4, color: colors.bodyGreen },
      { x: 3, y: 4, color: colors.bodyGreen },
      { x: 5, y: 4, color: colors.bodyGreen },
      { x: 6, y: 4, color: colors.bodyGreen },
      { x: 3, y: 5, color: colors.bodyGreen },
      { x: 4, y: 5, color: colors.bodyGreen },
      { x: 5, y: 5, color: colors.bodyGreen },

      // Eye - white part
      { x: 4, y: 3, color: colors.eyeWhite },
      { x: 3, y: 3, color: colors.eyeWhite },
      { x: 5, y: 3, color: colors.eyeWhite },
      { x: 4, y: 2, color: colors.eyeWhite },
      { x: 4, y: 4, color: colors.eyeWhite },

      // Eye - pupil
      { x: 4, y: 3, color: colors.eyePupil },

      // Tentacles
      { x: 2, y: 7, color: colors.tentacles },
      { x: 4, y: 7, color: colors.tentacles },
      { x: 6, y: 7, color: colors.tentacles },
      { x: 1, y: 8, color: colors.tentacles },
      { x: 3, y: 8, color: colors.tentacles },
      { x: 5, y: 8, color: colors.tentacles },
      { x: 7, y: 8, color: colors.tentacles },

      // Tentacle highlights
      { x: 2, y: 7, color: colors.tentacleLight },
      { x: 4, y: 7, color: colors.tentacleLight },
      { x: 6, y: 7, color: colors.tentacleLight },
    ];

    // Draw each pixel of the player
    playerPixels.forEach((pixel) => {
      drawPixel(
        ctx,
        playerX + pixel.x * pixelSize,
        playerY + pixel.y * pixelSize,
        pixelSize,
        pixel.color
      );
    });
  };

  // Helper function to draw a single pixel
  // const drawPixel = (
  //   ctx: CanvasRenderingContext2D,
  //   x: number,
  //   y: number,
  //   size: number,
  //   color: string
  // ) => {
  //   ctx.fillStyle = color;
  //   ctx.fillRect(x, y, size, size);
  // };
  const drawPixelMonsters = (ctx: CanvasRenderingContext2D) => {
    const { monsters, camera } = gameStateRef.current;
    const basePixelSize = 4;

    // Define space invader designs inspired by the classic arcade game
    const monsterDesigns = [
      // Red Space Invader
      {
        colors: {
          primary: "#FF0000", // Red
          outline: "#FF0000", // Same as primary for space invaders
        },
        pixels: [
          // Body
          { x: 1, y: 0, part: "primary" },
          { x: 2, y: 0, part: "primary" },
          { x: 3, y: 0, part: "primary" },
          { x: 4, y: 0, part: "primary" },
          { x: 5, y: 0, part: "primary" },
          { x: 6, y: 0, part: "primary" },

          { x: 0, y: 1, part: "primary" },
          { x: 1, y: 1, part: "primary" },
          { x: 2, y: 1, part: "primary" },
          { x: 3, y: 1, part: "primary" },
          { x: 4, y: 1, part: "primary" },
          { x: 5, y: 1, part: "primary" },
          { x: 6, y: 1, part: "primary" },
          { x: 7, y: 1, part: "primary" },

          { x: 0, y: 2, part: "primary" },
          { x: 1, y: 2, part: "primary" },
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },
          { x: 6, y: 2, part: "primary" },
          { x: 7, y: 2, part: "primary" },

          { x: 0, y: 3, part: "primary" },
          { x: 2, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 5, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          { x: 0, y: 4, part: "primary" },
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },
          { x: 7, y: 4, part: "primary" },

          { x: 1, y: 5, part: "primary" },
          { x: 2, y: 5, part: "primary" },
          { x: 5, y: 5, part: "primary" },
          { x: 6, y: 5, part: "primary" },

          { x: 0, y: 6, part: "primary" },
          { x: 2, y: 6, part: "primary" },
          { x: 5, y: 6, part: "primary" },
          { x: 7, y: 6, part: "primary" },
        ],
      },
      // Blue Space Invader
      {
        colors: {
          primary: "#0000FF", // Blue
          outline: "#0000FF", // Same as primary for space invaders
        },
        pixels: [
          // Center antenna
          { x: 3, y: 0, part: "primary" },
          { x: 4, y: 0, part: "primary" },

          // Top row
          { x: 2, y: 1, part: "primary" },
          { x: 3, y: 1, part: "primary" },
          { x: 4, y: 1, part: "primary" },
          { x: 5, y: 1, part: "primary" },

          // Second row
          { x: 1, y: 2, part: "primary" },
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },
          { x: 6, y: 2, part: "primary" },

          // Third row
          { x: 0, y: 3, part: "primary" },
          { x: 1, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 6, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          // Fourth row - full
          { x: 0, y: 4, part: "primary" },
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },
          { x: 7, y: 4, part: "primary" },

          // Fifth row
          { x: 0, y: 5, part: "primary" },
          { x: 2, y: 5, part: "primary" },
          { x: 5, y: 5, part: "primary" },
          { x: 7, y: 5, part: "primary" },

          // Bottom row - legs
          { x: 2, y: 6, part: "primary" },
          { x: 5, y: 6, part: "primary" },
        ],
      },
      // Green Space Invader
      {
        colors: {
          primary: "#00FF00", // Green
          outline: "#00FF00", // Same as primary for space invaders
        },
        pixels: [
          // Top antennas
          { x: 1, y: 0, part: "primary" },
          { x: 6, y: 0, part: "primary" },

          // Second row
          { x: 2, y: 1, part: "primary" },
          { x: 3, y: 1, part: "primary" },
          { x: 4, y: 1, part: "primary" },
          { x: 5, y: 1, part: "primary" },

          // Third row - full
          { x: 0, y: 2, part: "primary" },
          { x: 1, y: 2, part: "primary" },
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },
          { x: 6, y: 2, part: "primary" },
          { x: 7, y: 2, part: "primary" },

          // Fourth row
          { x: 0, y: 3, part: "primary" },
          { x: 1, y: 3, part: "primary" },
          { x: 2, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 5, y: 3, part: "primary" },
          { x: 6, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          // Fifth row
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },

          // Sixth row
          { x: 1, y: 5, part: "primary" },
          { x: 6, y: 5, part: "primary" },

          // Bottom row - legs
          { x: 0, y: 6, part: "primary" },
          { x: 7, y: 6, part: "primary" },
        ],
      },
      // Cyan Space Invader
      {
        colors: {
          primary: "#00FFFF", // Cyan
          outline: "#00FFFF", // Same as primary for space invaders
        },
        pixels: [
          // Top row
          { x: 3, y: 0, part: "primary" },
          { x: 4, y: 0, part: "primary" },

          // Second row
          { x: 2, y: 1, part: "primary" },
          { x: 3, y: 1, part: "primary" },
          { x: 4, y: 1, part: "primary" },
          { x: 5, y: 1, part: "primary" },

          // Third row - full
          { x: 1, y: 2, part: "primary" },
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },
          { x: 6, y: 2, part: "primary" },

          // Fourth row - with eyes
          { x: 0, y: 3, part: "primary" },
          { x: 1, y: 3, part: "primary" },
          { x: 2, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 5, y: 3, part: "primary" },
          { x: 6, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          // Fifth row
          { x: 0, y: 4, part: "primary" },
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },
          { x: 7, y: 4, part: "primary" },

          // Sixth row
          { x: 0, y: 5, part: "primary" },
          { x: 2, y: 5, part: "primary" },
          { x: 5, y: 5, part: "primary" },
          { x: 7, y: 5, part: "primary" },
        ],
      },
      // Magenta Space Invader
      {
        colors: {
          primary: "#FF00FF", // Magenta
          outline: "#FF00FF", // Same as primary for space invaders
        },
        pixels: [
          // Top row
          { x: 2, y: 0, part: "primary" },
          { x: 5, y: 0, part: "primary" },

          // Second row
          { x: 3, y: 1, part: "primary" },
          { x: 4, y: 1, part: "primary" },

          // Third row
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },

          // Fourth row - full
          { x: 0, y: 3, part: "primary" },
          { x: 1, y: 3, part: "primary" },
          { x: 2, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 5, y: 3, part: "primary" },
          { x: 6, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          // Fifth row
          { x: 0, y: 4, part: "primary" },
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },
          { x: 7, y: 4, part: "primary" },

          // Sixth row
          { x: 1, y: 5, part: "primary" },
          { x: 3, y: 5, part: "primary" },
          { x: 4, y: 5, part: "primary" },
          { x: 6, y: 5, part: "primary" },

          // Bottom row
          { x: 0, y: 6, part: "primary" },
          { x: 7, y: 6, part: "primary" },
        ],
      },
      // Yellow Space Invader
      {
        colors: {
          primary: "#FFFF00", // Yellow
          outline: "#FFFF00", // Same as primary for space invaders
        },
        pixels: [
          // Top row
          { x: 3, y: 0, part: "primary" },
          { x: 4, y: 0, part: "primary" },

          // Second row
          { x: 2, y: 1, part: "primary" },
          { x: 3, y: 1, part: "primary" },
          { x: 4, y: 1, part: "primary" },
          { x: 5, y: 1, part: "primary" },

          // Third row
          { x: 1, y: 2, part: "primary" },
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },
          { x: 6, y: 2, part: "primary" },

          // Fourth row - full with eyes
          { x: 0, y: 3, part: "primary" },
          { x: 1, y: 3, part: "primary" },
          { x: 2, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 5, y: 3, part: "primary" },
          { x: 6, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          // Fifth row
          { x: 0, y: 4, part: "primary" },
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },
          { x: 7, y: 4, part: "primary" },

          // Sixth row
          { x: 0, y: 5, part: "primary" },
          { x: 1, y: 5, part: "primary" },
          { x: 6, y: 5, part: "primary" },
          { x: 7, y: 5, part: "primary" },

          // Bottom row
          { x: 2, y: 6, part: "primary" },
          { x: 5, y: 6, part: "primary" },
        ],
      },
      // Orange Space Invader
      {
        colors: {
          primary: "#FFA500", // Orange
          outline: "#FFA500", // Same as primary for space invaders
        },
        pixels: [
          // Top row
          { x: 2, y: 0, part: "primary" },
          { x: 5, y: 0, part: "primary" },

          // Second row
          { x: 1, y: 1, part: "primary" },
          { x: 2, y: 1, part: "primary" },
          { x: 5, y: 1, part: "primary" },
          { x: 6, y: 1, part: "primary" },

          // Third row - full
          { x: 0, y: 2, part: "primary" },
          { x: 1, y: 2, part: "primary" },
          { x: 2, y: 2, part: "primary" },
          { x: 3, y: 2, part: "primary" },
          { x: 4, y: 2, part: "primary" },
          { x: 5, y: 2, part: "primary" },
          { x: 6, y: 2, part: "primary" },
          { x: 7, y: 2, part: "primary" },

          // Fourth row
          { x: 0, y: 3, part: "primary" },
          { x: 1, y: 3, part: "primary" },
          { x: 2, y: 3, part: "primary" },
          { x: 3, y: 3, part: "primary" },
          { x: 4, y: 3, part: "primary" },
          { x: 5, y: 3, part: "primary" },
          { x: 6, y: 3, part: "primary" },
          { x: 7, y: 3, part: "primary" },

          // Fifth row
          { x: 0, y: 4, part: "primary" },
          { x: 1, y: 4, part: "primary" },
          { x: 2, y: 4, part: "primary" },
          { x: 3, y: 4, part: "primary" },
          { x: 4, y: 4, part: "primary" },
          { x: 5, y: 4, part: "primary" },
          { x: 6, y: 4, part: "primary" },
          { x: 7, y: 4, part: "primary" },

          // Sixth row
          { x: 3, y: 5, part: "primary" },
          { x: 4, y: 5, part: "primary" },

          // Bottom row
          { x: 2, y: 6, part: "primary" },
          { x: 5, y: 6, part: "primary" },
        ],
      },
    ];

    // Draw monsters using their pixel designs
    monsters.forEach((monster, index) => {
      const monsterX = Math.floor(monster.x - camera.x - monster.width / 2);
      const monsterY = Math.floor(monster.y - camera.y - monster.height / 2);

      // Calculate pixel size based on monster size
      const pixelSize = basePixelSize * (monster.width / 32);

      // Use a different design for each monster (cycling through available designs)
      const design =
        monsterDesigns[monster.designIndex % monsterDesigns.length];

      // Draw each pixel of the monster
      design.pixels.forEach((pixel) => {
        drawPixel(
          ctx,
          monsterX + pixel.x * pixelSize,
          monsterY + pixel.y * pixelSize,
          pixelSize,
          design.colors[pixel.part as keyof typeof design.colors] || "#000000"
        );
      });
    });
  };

  const drawPixelBullets = (ctx: CanvasRenderingContext2D) => {
    const { player, camera } = gameStateRef.current;

    player.bullets.forEach((bullet) => {
      const bulletX = Math.floor(bullet.x - camera.x);
      const bulletY = Math.floor(bullet.y - camera.y);

      // Draw circular bullet with glow effect
      const radius = 6; // Larger bullet size

      // Outer glow
      const gradient = ctx.createRadialGradient(
        bulletX,
        bulletY,
        0,
        bulletX,
        bulletY,
        radius
      );
      gradient.addColorStop(0, "#fffc58"); // Bright center
      gradient.addColorStop(0.6, "#fffc5888"); // Semi-transparent middle
      gradient.addColorStop(1, "#fffc5800"); // Transparent edge

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bulletX, bulletY, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const updateCamera = () => {
    const { player } = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    gameStateRef.current.camera.x = player.x - canvas.width / 2;
    gameStateRef.current.camera.y = player.y - canvas.height / 2;

    gameStateRef.current.camera.x = Math.max(
      0,
      Math.min(gameStateRef.current.camera.x, MAP_WIDTH - canvas.width)
    );
    gameStateRef.current.camera.y = Math.max(
      0,
      Math.min(gameStateRef.current.camera.y, MAP_HEIGHT - canvas.height)
    );
  };

  const spawnMonster = () => {
    // Nếu có boss đang hoạt động, không tạo thêm quái vật nhỏ
    if (gameStateRef.current.boss && gameStateRef.current.boss.active) return;

    if (Math.random() < 0.02) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const spawnDistance = Math.max(canvas.width, canvas.height);
      const angle = Math.random() * Math.PI * 2;
      const { player } = gameStateRef.current;

      // Random size: big or small (reduced chance for small monsters)
      const isSmall = Math.random() > 0.7; // Only 30% chance for small monsters
      const sizeMultiplier = isSmall ? 1.2 : 2; // Small monsters are now 1.2x, big monsters are 2x
      const points = isSmall ? 30 : 10; // Small monsters worth more points

      // Random monster design
      const designIndex = Math.floor(Math.random() * 5); // 5 different designs

      const monster: Monster = {
        points: points,
        x: player.x + Math.cos(angle) * spawnDistance,
        y: player.y + Math.sin(angle) * spawnDistance,
        width: 32 * sizeMultiplier,
        height: 32 * sizeMultiplier,
        speed: isSmall ? Math.random() * 1.2 + 0.8 : Math.random() * 0.6 + 0.2, // Slightly reduced speeds
        dx: 0,
        dy: 0,
        designIndex: designIndex,
      };

      gameStateRef.current.monsters.push(monster);
    }
  };

  const updateBullets = () => {
    const { player } = gameStateRef.current;
    player.bullets = player.bullets.filter((bullet) => {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;
      return (
        bullet.x > 0 &&
        bullet.x < MAP_WIDTH &&
        bullet.y > 0 &&
        bullet.y < MAP_HEIGHT
      );
    });
  };

  const updateMonsters = () => {
    const { monsters, player } = gameStateRef.current;
    monsters.forEach((monster) => {
      const angle = Math.atan2(player.y - monster.y, player.x - monster.x);

      monster.dx = Math.cos(angle) * monster.speed;
      monster.dy = Math.sin(angle) * monster.speed;

      monster.x += monster.dx;
      monster.y += monster.dy;
    });

    gameStateRef.current.monsters = monsters.filter((monster) => {
      if (
        monster.x + monster.width / 4 > player.x - player.width / 4 &&
        monster.x - monster.width / 4 < player.x + player.width / 4 &&
        monster.y + monster.height / 4 > player.y - player.height / 4 &&
        monster.y - monster.height / 4 < player.y + player.height / 4
      ) {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setIsGameOver(true);
            gameStateRef.current.isGameOver = true;
          }
          return newLives;
        });
        return false;
      }

      return (
        monster.x > 0 &&
        monster.x < MAP_WIDTH &&
        monster.y > 0 &&
        monster.y < MAP_HEIGHT
      );
    });
  };

  const checkCollisions = () => {
    const { player, monsters, boss } = gameStateRef.current;

    // Kiểm tra va chạm đạn với quái vật
    player.bullets = player.bullets.filter((bullet) => {
      // Kiểm tra va chạm với boss
      if (boss && boss.active) {
        const dx = bullet.x - boss.x;
        const dy = bullet.y - boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < boss.width / 2) {
          boss.health -= 5; // Mỗi viên đạn gây 5 sát thương thay vì 1

          // Nếu boss hết máu
          if (boss.health <= 0) {
            boss.active = false;
            gameStateRef.current.score += 1000; // Thưởng điểm khi tiêu diệt boss (tăng từ 200 lên 1000)
            gameStateRef.current.boss = null; // Xóa boss để quái vật nhỏ xuất hiện lại
            gameStateRef.current.bossDefeated = true; // Đánh dấu boss đã bị đánh bại
          }

          return false; // Xóa viên đạn
        }
      }

      // Kiểm tra va chạm với quái vật thường
      for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];
        const dx = bullet.x - monster.x;
        const dy = bullet.y - monster.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < monster.width / 2) {
          monsters.splice(i, 1);
          gameStateRef.current.score += monster.points;
          return false;
        }
      }

      return true;
    });

    // Kiểm tra va chạm người chơi với quái vật
    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      const dx = player.x - monster.x;
      const dy = player.y - monster.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (player.width + monster.width) / 2) {
        monsters.splice(i, 1);
        player.lives -= 1;

        if (player.lives <= 0) {
          gameStateRef.current.isGameOver = true;
        }

        break;
      }
    }

    // Kiểm tra va chạm người chơi với boss
    if (boss && boss.active) {
      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < (player.width + boss.width) / 2) {
        player.lives -= 1;

        if (player.lives <= 0) {
          gameStateRef.current.isGameOver = true;
        }
      }
    }
  };

  const handlePlayerMovement = () => {
    const { player, keys } = gameStateRef.current;
    const speed = player.speed;

    // Thêm chuyển động theo đường chéo với tốc độ không đổi
    let dx = 0;
    let dy = 0;

    if (keys["ArrowUp"] || keys["w"]) dy -= 1;
    if (keys["ArrowDown"] || keys["s"]) dy += 1;
    if (keys["ArrowLeft"] || keys["a"]) dx -= 1;
    if (keys["ArrowRight"] || keys["d"]) dx += 1;

    // Chuẩn hóa vector chuyển động để tốc độ không đổi khi di chuyển chéo
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * speed;
      dy = (dy / length) * speed;
    } else {
      dx = dx * speed;
      dy = dy * speed;
    }

    player.x += dx;
    player.y += dy;

    // Giới hạn người chơi trong bản đồ
    player.x = Math.max(
      player.width / 2,
      Math.min(MAP_WIDTH - player.width / 2, player.x)
    );
    player.y = Math.max(
      player.height / 2,
      Math.min(MAP_HEIGHT - player.height / 2, player.y)
    );
  };

  const updateBoss = () => {
    const { boss, player } = gameStateRef.current;
    if (!boss || !boss.active) return;

    // Di chuyển boss về phía người chơi
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 200) {
      // Giữ khoảng cách với người chơi
      boss.dx = (dx / distance) * boss.speed;
      boss.dy = (dy / distance) * boss.speed;
    } else {
      // Nếu đủ gần, di chuyển ngẫu nhiên
      if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        boss.dx = Math.cos(angle) * boss.speed;
        boss.dy = Math.sin(angle) * boss.speed;
      }
    }

    boss.x += boss.dx;
    boss.y += boss.dy;

    // Tạo quái vật nhỏ
    boss.spawnTimer += 1;
    if (boss.spawnTimer >= 180) {
      // Mỗi 3 giây (60fps * 3)
      boss.spawnTimer = 0;

      // Tạo quái vật nhỏ xung quanh boss
      const spawnDistance = 50;
      const angle = Math.random() * Math.PI * 2;

      const monster: Monster = {
        points: 20,
        x: boss.x + Math.cos(angle) * spawnDistance,
        y: boss.y + Math.sin(angle) * spawnDistance,
        width: 32,
        height: 32,
        speed: Math.random() * 1.2 + 0.8,
        dx: 0,
        dy: 0,
        designIndex: Math.floor(Math.random() * 5),
      };

      gameStateRef.current.monsters.push(monster);
    }
  };

  const checkBossSpawn = () => {
    const { score, boss, bossDefeated } = gameStateRef.current;

    // Chỉ tạo boss nếu đạt 500 điểm, chưa có boss và boss chưa từng bị đánh bại
    if (score >= 500 && !boss && !bossDefeated) {
      const { player } = gameStateRef.current;

      // Tạo boss ở vị trí cách người chơi một khoảng
      const spawnDistance = 400;
      const angle = Math.random() * Math.PI * 2;

      const newBoss: Boss = {
        x: player.x + Math.cos(angle) * spawnDistance,
        y: player.y + Math.sin(angle) * spawnDistance,
        width: 288, // Kích thước lớn gấp ba (96 * 3)
        height: 252, // Kích thước lớn gấp ba (84 * 3)
        speed: 0.5, // Di chuyển chậm hơn vì to hơn
        dx: 0,
        dy: 0,
        health: 1000,
        maxHealth: 1000,
        spawnTimer: 0,
        active: true,
      };

      // Xóa tất cả quái vật nhỏ
      gameStateRef.current.monsters = [];

      // Thêm boss vào game
      gameStateRef.current.boss = newBoss;
    }
  };

  const gameLoop = () => {
    if (gameStateRef.current.isGameOver) {
      setIsGameOver(true);
      return;
    }

    handlePlayerMovement();
    updateBullets();
    updateMonsters();
    spawnMonster(); // Thêm lại việc tạo quái vật nhỏ trong mỗi vòng lặp
    updateBoss(); // Thêm cập nhật boss
    checkCollisions();
    updateCamera();
    checkBossSpawn(); // Kiểm tra điều kiện xuất hiện boss

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawPixelBackground(ctx);
        drawPixelBullets(ctx);
        drawPixelMonsters(ctx);
        drawPixelBoss(ctx); // Vẽ boss
        drawPixelPlayer(ctx);
        drawPixelInterface(ctx);
      }
    }

    setScore(gameStateRef.current.score);
    setLives(gameStateRef.current.player.lives);

    requestAnimationFrame(gameLoop);
  };

  const drawPixelInterface = (ctx: CanvasRenderingContext2D) => {
    const { score, player, boss } = gameStateRef.current;

    // Hiển thị điểm
    ctx.fillStyle = "#ffffff";

    // Hiển thị thông tin boss nếu có
    // if (boss && boss.active) {
    //   ctx.fillText(`Boss HP: ${boss.health}/${boss.maxHealth}`, 20, 90);
    // }
  };

  // Cập nhật hàm vẽ boss với thiết kế rùng rợn hơn
  const drawPixelBoss = (ctx: CanvasRenderingContext2D) => {
    const { boss, camera } = gameStateRef.current;
    if (!boss || !boss.active) return;

    const bossX = Math.floor(boss.x - camera.x - boss.width / 2);
    const bossY = Math.floor(boss.y - camera.y - boss.height / 2);
    const pixelSize = 15; // Pixel size lớn hơn cho boss

    // Thiết kế boss dựa trên hình ảnh space invader nhưng giữ màu xanh lá
    const bossColors = {
      primary: "#00AA00", // Xanh lá đậm (giữ nguyên màu xanh lá)
      secondary: "#FFFFFF", // Trắng cho mắt
      glow: "#00FF00", // Xanh lá sáng cho hiệu ứng phát sáng
    };

    // Vẽ hiệu ứng phát sáng xung quanh boss
    const glowRadius = boss.width * 0.6;
    const gradient = ctx.createRadialGradient(
      bossX + boss.width / 2,
      bossY + boss.height / 2,
      0,
      bossX + boss.width / 2,
      bossY + boss.height / 2,
      glowRadius
    );
    gradient.addColorStop(0, `${bossColors.glow}33`);
    gradient.addColorStop(1, `${bossColors.glow}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      bossX + boss.width / 2,
      bossY + boss.height / 2,
      glowRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Vẽ thân boss theo kiểu space invader
    const bossPixels = [
      // Thiết kế space invader lớn hơn, dựa trên hình ảnh
      // Hàng đầu - 2 khối vuông ở trên cùng
      { x: 2, y: 0, color: bossColors.primary },
      { x: 3, y: 0, color: bossColors.primary },
      { x: 12, y: 0, color: bossColors.primary },
      { x: 13, y: 0, color: bossColors.primary },

      // Hàng 1
      { x: 2, y: 1, color: bossColors.primary },
      { x: 3, y: 1, color: bossColors.primary },
      { x: 12, y: 1, color: bossColors.primary },
      { x: 13, y: 1, color: bossColors.primary },

      // Hàng 2
      { x: 4, y: 2, color: bossColors.primary },
      { x: 5, y: 2, color: bossColors.primary },
      { x: 6, y: 2, color: bossColors.primary },
      { x: 7, y: 2, color: bossColors.primary },
      { x: 8, y: 2, color: bossColors.primary },
      { x: 9, y: 2, color: bossColors.primary },
      { x: 10, y: 2, color: bossColors.primary },
      { x: 11, y: 2, color: bossColors.primary },

      // Hàng 3
      { x: 2, y: 3, color: bossColors.primary },
      { x: 3, y: 3, color: bossColors.primary },
      { x: 4, y: 3, color: bossColors.primary },
      { x: 5, y: 3, color: bossColors.primary },
      { x: 6, y: 3, color: bossColors.primary },
      { x: 7, y: 3, color: bossColors.primary },
      { x: 8, y: 3, color: bossColors.primary },
      { x: 9, y: 3, color: bossColors.primary },
      { x: 10, y: 3, color: bossColors.primary },
      { x: 11, y: 3, color: bossColors.primary },
      { x: 12, y: 3, color: bossColors.primary },
      { x: 13, y: 3, color: bossColors.primary },

      // Hàng 4 - với mắt
      { x: 0, y: 4, color: bossColors.primary },
      { x: 1, y: 4, color: bossColors.primary },
      { x: 2, y: 4, color: bossColors.primary },
      { x: 3, y: 4, color: bossColors.primary },
      { x: 4, y: 4, color: bossColors.primary },
      { x: 5, y: 4, color: bossColors.primary },
      { x: 6, y: 4, color: bossColors.primary },
      { x: 7, y: 4, color: bossColors.secondary }, // Mắt trái
      { x: 8, y: 4, color: bossColors.primary },
      { x: 9, y: 4, color: bossColors.secondary }, // Mắt phải
      { x: 10, y: 4, color: bossColors.primary },
      { x: 11, y: 4, color: bossColors.primary },
      { x: 12, y: 4, color: bossColors.primary },
      { x: 13, y: 4, color: bossColors.primary },
      { x: 14, y: 4, color: bossColors.primary },
      { x: 15, y: 4, color: bossColors.primary },

      // Hàng 5
      { x: 0, y: 5, color: bossColors.primary },
      { x: 1, y: 5, color: bossColors.primary },
      { x: 2, y: 5, color: bossColors.primary },
      { x: 3, y: 5, color: bossColors.primary },
      { x: 4, y: 5, color: bossColors.primary },
      { x: 5, y: 5, color: bossColors.primary },
      { x: 6, y: 5, color: bossColors.primary },
      { x: 7, y: 5, color: bossColors.primary },
      { x: 8, y: 5, color: bossColors.primary },
      { x: 9, y: 5, color: bossColors.primary },
      { x: 10, y: 5, color: bossColors.primary },
      { x: 11, y: 5, color: bossColors.primary },
      { x: 12, y: 5, color: bossColors.primary },
      { x: 13, y: 5, color: bossColors.primary },
      { x: 14, y: 5, color: bossColors.primary },
      { x: 15, y: 5, color: bossColors.primary },

      // Hàng 6 - miệng
      { x: 0, y: 6, color: bossColors.primary },
      { x: 1, y: 6, color: bossColors.primary },
      { x: 2, y: 6, color: bossColors.primary },
      { x: 3, y: 6, color: bossColors.primary },
      { x: 4, y: 6, color: bossColors.primary },
      { x: 5, y: 6, color: bossColors.primary },
      { x: 6, y: 6, color: bossColors.primary },
      { x: 7, y: 6, color: bossColors.primary },
      { x: 8, y: 6, color: bossColors.primary },
      { x: 9, y: 6, color: bossColors.primary },
      { x: 10, y: 6, color: bossColors.primary },
      { x: 11, y: 6, color: bossColors.primary },
      { x: 12, y: 6, color: bossColors.primary },
      { x: 13, y: 6, color: bossColors.primary },
      { x: 14, y: 6, color: bossColors.primary },
      { x: 15, y: 6, color: bossColors.primary },

      // Hàng 7 - miệng rộng
      { x: 2, y: 7, color: bossColors.primary },
      { x: 3, y: 7, color: bossColors.primary },
      { x: 4, y: 7, color: bossColors.primary },
      { x: 5, y: 7, color: bossColors.primary },
      { x: 6, y: 7, color: bossColors.primary },
      { x: 7, y: 7, color: bossColors.primary },
      { x: 8, y: 7, color: bossColors.primary },
      { x: 9, y: 7, color: bossColors.primary },
      { x: 10, y: 7, color: bossColors.primary },
      { x: 11, y: 7, color: bossColors.primary },
      { x: 12, y: 7, color: bossColors.primary },
      { x: 13, y: 7, color: bossColors.primary },

      // Hàng 8 - chân
      { x: 0, y: 8, color: bossColors.primary },
      { x: 1, y: 8, color: bossColors.primary },
      { x: 2, y: 8, color: bossColors.primary },
      { x: 5, y: 8, color: bossColors.primary },
      { x: 6, y: 8, color: bossColors.primary },
      { x: 9, y: 8, color: bossColors.primary },
      { x: 10, y: 8, color: bossColors.primary },
      { x: 13, y: 8, color: bossColors.primary },
      { x: 14, y: 8, color: bossColors.primary },
      { x: 15, y: 8, color: bossColors.primary },
    ];

    // Vẽ từng pixel của boss
    bossPixels.forEach((pixel) => {
      drawPixel(
        ctx,
        bossX + pixel.x * pixelSize,
        bossY + pixel.y * pixelSize,
        pixelSize,
        pixel.color
      );
    });

    // Vẽ hiệu ứng nhấp nháy cho mắt
    const time = Date.now() / 200;
    const eyeGlow = Math.sin(time) * 0.5 + 0.5;

    // Vẽ hiệu ứng phát sáng cho mắt
    [
      { x: 7, y: 4 },
      { x: 9, y: 4 },
    ].forEach((eye) => {
      const eyeGradient = ctx.createRadialGradient(
        bossX + eye.x * pixelSize,
        bossY + eye.y * pixelSize,
        0,
        bossX + eye.x * pixelSize,
        bossY + eye.y * pixelSize,
        pixelSize * 2
      );
      eyeGradient.addColorStop(
        0,
        `${bossColors.secondary}${Math.floor(eyeGlow * 255)
          .toString(16)
          .padStart(2, "0")}`
      );
      eyeGradient.addColorStop(1, `${bossColors.secondary}00`);

      ctx.fillStyle = eyeGradient;
      ctx.beginPath();
      ctx.arc(
        bossX + eye.x * pixelSize,
        bossY + eye.y * pixelSize,
        pixelSize * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Vẽ thanh máu
    const healthBarWidth = boss.width;
    const healthBarHeight = 16; // Thanh máu to hơn
    const healthPercentage = boss.health / boss.maxHealth;

    // Nền thanh máu
    ctx.fillStyle = "#333333";
    ctx.fillRect(
      bossX,
      bossY - healthBarHeight - 10,
      healthBarWidth,
      healthBarHeight
    );

    // Máu hiện tại
    ctx.fillStyle =
      healthPercentage > 0.6
        ? "#00FF00"
        : healthPercentage > 0.3
        ? "#FFFF00"
        : "#FF0000";

    ctx.fillRect(
      bossX,
      bossY - healthBarHeight - 10,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );

    // Viền thanh máu
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      bossX,
      bossY - healthBarHeight - 10,
      healthBarWidth,
      healthBarHeight
    );
  };

  const handleRestart = () => {
    // Reset game
    gameStateRef.current.isGameOver = false;
    setIsGameOver(false);
    setLives(10);
    setScore(0);
    gameStateRef.current.monsters = [];
    gameStateRef.current.player.bullets = [];
    gameStateRef.current.player.x = MAP_WIDTH / 2;
    gameStateRef.current.player.y = MAP_HEIGHT / 2;
    gameStateRef.current.bossDefeated = false; // Reset biến bossDefeated khi restart game
  };

  const handleBossDefeat = async () => {
    console.log("Boss defeated!");

    // Tạo tweet cố định
    const tweetText = `Boss đã bị đánh bại bởi người chơi ${
      contractAddress || "Unknown"
    } với ${gameStateRef.current.score} điểm!`;
    setTweetContent(tweetText);
    setTweetSent(true);
  };

  const handleGameOver = async () => {
    console.log("Game over!");

    if (!gameStateRef.current.bossDefeated) {
      try {
        // Gọi API để tạo tweet
        const response = await fetch("/api/generate-tweet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerAddress: contractAddress,
            score: gameStateRef.current.score,
            bossDefeated: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTweetContent(data.tweet);
          setTweetSent(true);
        } else {
          console.error("Failed to generate tweet");
        }
      } catch (error) {
        console.error("Error generating tweet:", error);
        // Fallback to fixed tweet if API fails
        const tweetText = `Boss đã đánh bại người chơi ${
          contractAddress || "Unknown"
        }. Chỉ đạt ${gameStateRef.current.score} điểm!`;
        setTweetContent(tweetText);
        setTweetSent(true);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas to fullscreen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (gameStateRef.current.isGameOver) {
        handleRestart();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + gameStateRef.current.camera.x;
      const mouseY = e.clientY - rect.top + gameStateRef.current.camera.y;

      const { player } = gameStateRef.current;
      const angle = Math.atan2(mouseY - player.y, mouseX - player.x);

      const bullet: Bullet = {
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10,
      };

      player.bullets.push(bullet);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("click", handleClick);

    gameLoop();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Thêm useEffect để theo dõi khi game kết thúc
  useEffect(() => {
    if (isGameOver) {
      console.log(
        "Game over detected in useEffect, bossDefeated:",
        gameStateRef.current.bossDefeated
      );
      if (gameStateRef.current.bossDefeated) {
        handleBossDefeat();
      } else {
        handleGameOver();
      }
    }
  }, [isGameOver]);

  return (
    <div className="flex flex-col items-center w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
      <div className="absolute top-[-300px] left-[30px] text-white font-pixel">
        <Header />
        <p className="text-md mb-1 font-mono">
          Điểm: <span className="font-mono">{score}</span>
        </p>
        <p className="text-md font-mono">
          Mạng: <span className="font-mono">{lives}</span>
        </p>
      </div>
      <Leaderboard />

      {isGameOver && (
        <GameOverPopup
          score={score}
          onRestart={handleRestart}
          tweetContent={tweetContent}
          contractAddress={contractAddress}
        />
      )}
    </div>
  );
};

export default Game;
