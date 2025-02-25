"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type RGB = [number, number, number];

interface LightPoint {
  id: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  baseX: number;
  baseY: number;
  color: string;
  size: number;
  pulseSize: number;
  pulseSpeed: number;
  colorTransition: number;
  currentColor: RGB;
  targetColor: RGB;
  colorBlendFactor: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  secondaryOrbitRadius: number;
  secondaryOrbitSpeed: number;
  secondaryOrbitAngle: number;
  springX: number;
  springY: number;
  phase: number;
  amplitude: number;
  frequency: number;
  waveOffset: number;
}

export const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pointsRef = useRef<LightPoint[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    document.documentElement.style.backgroundColor = "#030712";

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    const setCanvasSize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const colors: RGB[] = [
      [147, 51, 234], // purple
      [79, 70, 229], // indigo
      [59, 130, 246], // blue
      [236, 72, 153], // pink
      [99, 102, 241], // violet
      [168, 85, 247], // purple
      [124, 58, 237], // violet
      [219, 39, 119], // pink
    ];

    const createLightPoint = (
      baseX: number,
      baseY: number,
      orbitRadius: number,
      orbitSpeed: number,
      size: number,
      initialColor: RGB
    ): LightPoint => ({
      id: Math.random().toString(36).substring(2, 9),
      x: baseX,
      y: baseY,
      angle: Math.random() * Math.PI * 2,
      radius: orbitRadius,
      speed: orbitSpeed,
      baseX,
      baseY,
      color: `rgba(${initialColor.join(",")}, 0.35)`,
      size,
      pulseSize: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.01,
      colorTransition: Math.random(),
      currentColor: initialColor,
      targetColor: colors[(colors.indexOf(initialColor) + 1) % colors.length],
      colorBlendFactor: Math.random(),
      orbitRadius,
      orbitSpeed,
      orbitAngle: Math.random() * Math.PI * 2,
      secondaryOrbitRadius: 8 + Math.random() * 12,
      secondaryOrbitSpeed: (Math.random() - 0.5) * 0.03,
      secondaryOrbitAngle: Math.random() * Math.PI * 2,
      springX: baseX,
      springY: baseY,
      phase: Math.random() * Math.PI * 2,
      amplitude: 2 + Math.random() * 3,
      frequency: 0.02 + Math.random() * 0.02,
      waveOffset: Math.random() * Math.PI * 2,
    });

    const generatePoints = (): LightPoint[] => {
      const points: LightPoint[] = [];

      // Adjust number of points and sizes based on screen width
      const screenWidth = window.innerWidth;
      const isSmallScreen = screenWidth < 768;

      const config = {
        innerPoints: isSmallScreen ? 8 : 12,
        middlePoints: isSmallScreen ? 6 : 10,
        outerPoints: isSmallScreen ? 4 : 8,
        innerRadius: isSmallScreen ? 100 : 160,
        middleRadius: isSmallScreen ? 140 : 220,
        outerRadius: isSmallScreen ? 180 : 280,
        sizeMultiplier: isSmallScreen ? 0.7 : 1,
      };

      [
        {
          count: config.innerPoints,
          radius: config.innerRadius,
          sizeRange: [220 * config.sizeMultiplier, 280 * config.sizeMultiplier],
          speedRange: [0.003, 0.005],
        },
        {
          count: config.middlePoints,
          radius: config.middleRadius,
          sizeRange: [235 * config.sizeMultiplier, 300 * config.sizeMultiplier],
          speedRange: [0.0025, 0.004],
        },
        {
          count: config.outerPoints,
          radius: config.outerRadius,
          sizeRange: [250 * config.sizeMultiplier, 320 * config.sizeMultiplier],
          speedRange: [0.002, 0.003],
        },
      ].forEach(({ count, radius, sizeRange, speedRange }, ringIndex) => {
        for (let i = 0; i < count; i++) {
          const angle =
            (i / count) * Math.PI * 2 + (ringIndex * Math.PI) / count;
          const distanceVariation = Math.random() * 30 - 15;
          const distance = radius + distanceVariation;

          const baseX = centerX + Math.cos(angle) * distance;
          const baseY = centerY + Math.sin(angle) * distance;

          points.push(
            createLightPoint(
              baseX,
              baseY,
              20 + Math.random() * 25,
              speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
              sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
              colors[(i + ringIndex * 3) % colors.length]
            )
          );
        }
      });

      return points;
    };

    const blendColors = (color1: RGB, color2: RGB, factor: number): string => {
      const r = Math.round(color1[0] * (1 - factor) + color2[0] * factor);
      const g = Math.round(color1[1] * (1 - factor) + color2[1] * factor);
      const b = Math.round(color1[2] * (1 - factor) + color2[2] * factor);
      return `rgba(${r}, ${g}, ${b}, 0.35)`;
    };

    const easeInOutSine = (x: number): number => {
      return -(Math.cos(Math.PI * x) - 1) / 2;
    };

    const updatePointPosition = (
      point: LightPoint,
      deltaTime: number
    ): void => {
      const normalizedDelta = Math.min(deltaTime / 16.667, 2);

      point.orbitAngle += point.orbitSpeed * normalizedDelta;
      point.secondaryOrbitAngle += point.secondaryOrbitSpeed * normalizedDelta;
      point.pulseSize += point.pulseSpeed * normalizedDelta;
      point.phase += point.frequency * normalizedDelta;

      const primaryOffsetX = Math.cos(point.orbitAngle) * point.orbitRadius;
      const primaryOffsetY = Math.sin(point.orbitAngle) * point.orbitRadius;

      const secondaryOffsetX =
        Math.cos(point.secondaryOrbitAngle) * point.secondaryOrbitRadius;
      const secondaryOffsetY =
        Math.sin(point.secondaryOrbitAngle) * point.secondaryOrbitRadius;

      const waveX = Math.cos(point.phase + point.waveOffset) * point.amplitude;
      const waveY = Math.sin(point.phase + point.waveOffset) * point.amplitude;

      point.springX = point.baseX + primaryOffsetX + secondaryOffsetX + waveX;
      point.springY = point.baseY + primaryOffsetY + secondaryOffsetY + waveY;

      point.x += (point.springX - point.x) * 0.1;
      point.y += (point.springY - point.y) * 0.1;
    };

    const animate = (timestamp: number): void => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const deltaTime = timestamp - lastUpdateRef.current;
      lastUpdateRef.current = timestamp;

      if (deltaTime > 50) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      const backgroundGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        window.innerWidth * 0.6
      );
      backgroundGradient.addColorStop(0, "rgba(30, 30, 50, 0.06)");
      backgroundGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = backgroundGradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      pointsRef.current.forEach((point) => {
        updatePointPosition(point, deltaTime);

        const pulseFactor = Math.sin(point.pulseSize) * 0.15 + 0.85;

        point.colorBlendFactor += 0.0004 * deltaTime;
        if (point.colorBlendFactor >= 1) {
          point.colorBlendFactor = 0;
          point.currentColor = point.targetColor;
          point.targetColor =
            colors[(colors.indexOf(point.targetColor) + 1) % colors.length];
        }

        const currentBlendedColor = blendColors(
          point.currentColor,
          point.targetColor,
          easeInOutSine(point.colorBlendFactor)
        );

        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          point.size * pulseFactor
        );

        gradient.addColorStop(0, currentBlendedColor);
        gradient.addColorStop(0.5, currentBlendedColor.replace("0.35", "0.1"));
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    pointsRef.current = generatePoints();
    setIsInitialized(true);
    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = (): void => {
      setCanvasSize();
      const newCenterX = window.innerWidth / 2;
      const newCenterY = window.innerHeight / 2;
      pointsRef.current.forEach((point) => {
        const dx = point.baseX - centerX;
        const dy = point.baseY - centerY;
        point.baseX = newCenterX + dx;
        point.baseY = newCenterY + dy;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        className="fixed inset-0 overflow-hidden bg-[#030712]"
      >
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-full h-full -z-10"
          style={{
            background: "transparent",
            filter: "blur(10px)",
            opacity: isInitialized ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
        <motion.div
          className="fixed inset-0 -z-10 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          style={{
            background: `
              radial-gradient(
                circle at center,
                transparent 0%,
                transparent 55%,
                rgba(3, 7, 18, 0.7) 75%,
                rgba(3, 7, 18, 1) 100%
              )
            `,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
