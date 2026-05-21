/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

interface SparklesCoreProps {
  background: string;
  className?: string;
  particleCount?: number;
  colors?: string[];
  speed?: number;
  minSize?: number;
  maxSize?: number;
}

export const SparklesCore = ({
  background,
  className,
  particleCount = 50,
  colors = ['#C8A96B', '#0F172A', '#E5E7EB', '#F8F7F4'],
  speed = 1,
  minSize = 2,
  maxSize = 5,
}: SparklesCoreProps) => {
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

  useEffect(() => {
    const container = document.getElementById('tsparticlesfullpage');
    if (!container) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    const newParticles: SparkleParticle[] = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * w,
      y: Math.random() * h,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * (maxSize - minSize) + minSize,
      delay: Math.random() * 2,
    }));

    setParticles(newParticles);
  }, [particleCount, colors, minSize, maxSize]);

  return (
    <div
      id="tsparticlesfullpage"
      className={`w-full h-full absolute top-0 left-0 z-0 ${className}`}
      style={{ background }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            filter: 'blur(1px)',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: speed * 3,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
