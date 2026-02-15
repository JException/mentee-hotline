"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number; // For 3D depth effect
  angle: number;
  radius: number; // Distance from center
  speed: number;
  char: string;
  opacity: number;
}

export default function GalaxySpiral() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let centerX = width / 2;
    let centerY = height / 2;

    // Configuration for the "Expensive" Feel
    const starCount = 400; // Number of binary bits
    const baseSpeed = 0.002; // How fast the galaxy rotates
    const colors = ["#ccfbf1", "#5eead4", "#2dd4bf", "#0d9488"]; // Tailwind Teal 100-600
    
    // Initialize stars
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(createStar(width, height));
    }

    function createStar(w: number, h: number): Star {
      const angle = Math.random() * Math.PI * 2;
      // Distribute stars mostly in the middle-to-outer ring
      const radius = Math.random() * (Math.max(w, h) * 0.6) + 50; 
      
      return {
        x: 0,
        y: 0,
        z: Math.random() * 2 + 0.5, // Depth scale
        angle,
        radius,
        speed: (Math.random() * 0.005) + baseSpeed, 
        char: Math.random() > 0.5 ? "1" : "0",
        opacity: Math.random(),
      };
    }

    const draw = () => {
      // 1. Create trails (Fade effect instead of clear)
      // Uses the deep teal background color with very low opacity
      ctx.fillStyle = "rgba(0, 30, 30, 0.2)"; 
      ctx.fillRect(0, 0, width, height);

      // 2. Update and Draw each star
      stars.forEach((star) => {
        // Move star: Angle increases (rotation), Radius decreases (suction)
        star.angle += star.speed; 
        star.radius -= 0.3; // Slight inward pull (vortex effect)

        // Reset if sucked into the black hole or too far out
        if (star.radius < 20) {
           star.radius = Math.max(width, height) * 0.6;
           star.opacity = 0; // Fade in gradually
        }
        if (star.opacity < 1) star.opacity += 0.01;

        // Calculate 2D position from Polar coordinates
        const x = centerX + Math.cos(star.angle) * star.radius;
        const y = centerY + Math.sin(star.angle) * star.radius;

        // Visuals
        const depthScale = star.radius / (Math.max(width, height) * 0.5); // Smaller when closer to center
        const fontSize = 10 + (depthScale * 10); // Dynamic font size
        
        ctx.font = `${fontSize}px monospace`;
        
        // Glow Effect
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#2dd4bf"; // Teal glow

        // Color logic: Bright white/cyan for outer, dim teal for inner
        const colorIndex = Math.floor(Math.random() * colors.length);
        ctx.fillStyle = `rgba(45, 212, 191, ${star.opacity * depthScale})`; // Teal-400 base

        ctx.fillText(star.char, x, y);
      });

      // Reset Shadow for next frame (performance)
      ctx.shadowBlur = 0;
      
      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none -z-0"
      style={{ background: 'radial-gradient(circle at center, #001e1e 0%, #000000 100%)' }}
    />
  );
}