"use client";
import { FC, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { useAccount } from "@starknet-react/core";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const Page: FC = () => {
  const { address } = useAccount();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define the hardcoded smart contract address
  const hardcodedContractAddress =
    "0x061f7a7802c2a5bddcaf22bd437d2271204cd75a9da6793d5ff50bfb9ad50d18";

  const handlePlayGame = () => {
    if (address) {
      router.push(`/play/${address}`);
    } else {
      console.log("No address");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create monsters array
    const monsters = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      designIndex: Math.floor(Math.random() * 7), // 7 different designs
    }));

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each monster
      monsters.forEach((monster) => {
        // Update position
        monster.x += monster.dx;
        monster.y += monster.dy;

        // Bounce off walls
        if (monster.x < 0 || monster.x > canvas.width) monster.dx *= -1;
        if (monster.y < 0 || monster.y > canvas.height) monster.dy *= -1;

        // Draw monster using the same design system from Game.tsx
        drawMonster(ctx, monster);
      });

      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'url("https://gold-imperial-tuna-683.mypinata.cloud/ipfs/bafybeif7i2yora3l4xfxfak2qmzr6cqssub6gmhhb54zvi5h4rvak7xv4m") center/cover',
        }}
      />
      <div className="relative z-10">
        <Header />

        <div className="flex flex-col items-center justify-center mt-[50px]">
          <Button
            onClick={handlePlayGame}
            className="text-lg font-bold"
            disabled={!address}
          >
            {address ? "Play Game" : "Connect Wallet to Play"}
          </Button>
          {!address && (
            <p className="mt-4 text-red-500 font-medium">
              Please connect your wallet to play the game
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to draw a single pixel
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

// Function to draw a monster (simplified version from Game.tsx)
const drawMonster = (
  ctx: CanvasRenderingContext2D,
  monster: { x: number; y: number; designIndex: number }
) => {
  const pixelSize = 2; // Smaller size for background monsters
  const designs = [
    { color: "#FF0000" }, // Red
    { color: "#0000FF" }, // Blue
    { color: "#00FF00" }, // Green
    { color: "#00FFFF" }, // Cyan
    { color: "#FF00FF" }, // Magenta
    { color: "#FFFF00" }, // Yellow
    { color: "#FFA500" }, // Orange
  ];

  const design = designs[monster.designIndex];

  // Simple 8x8 monster shape
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (Math.random() > 0.7) {
        // Create a random pixelated effect
        drawPixel(
          ctx,
          monster.x + x * pixelSize,
          monster.y + y * pixelSize,
          pixelSize,
          design.color
        );
      }
    }
  }
};

export default Page;
