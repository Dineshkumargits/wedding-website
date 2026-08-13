'use client';

import React, { useEffect, useRef } from 'react';

export default function MouseTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastSpawnTime = 0;
    const spawnThrottle = 35; // Spawn a sparkle every 35ms of mouse movement

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawnTime < spawnThrottle) return;
      lastSpawnTime = now;

      createSparkle(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastSpawnTime < spawnThrottle) return;
      lastSpawnTime = now;

      if (e.touches.length > 0) {
        createSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const createSparkle = (x: number, y: number) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'absolute pointer-events-none select-none z-40';
      
      // Calculate random parameters
      const size = Math.random() * 12 + 6; // 6px to 18px
      const rotate = Math.random() * 360;
      
      // Style sparkle
      sparkle.style.left = `${x + window.scrollX - size / 2}px`;
      sparkle.style.top = `${y + window.scrollY - size / 2}px`;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      
      // Gold Sparkle SVG Path
      sparkle.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" class="w-full h-full text-gold-light" style="transform: rotate(${rotate}deg); filter: drop-shadow(0 0 4px rgba(212,175,55,0.7));">
          <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" fill="currentColor"/>
        </svg>
      `;

      // Animation parameters
      const velocityX = (Math.random() - 0.5) * 1.5;
      const velocityY = Math.random() * 1.5 + 0.5; // slight falling effect
      
      sparkle.style.animation = 'sparkle-fade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';

      container.appendChild(sparkle);

      // Simple frame-based movement for the sparkle
      let posX = x + window.scrollX - size / 2;
      let posY = y + window.scrollY - size / 2;
      let opacity = 1;
      
      const animate = () => {
        if (!sparkle.parentNode) return;
        posX += velocityX;
        posY += velocityY;
        opacity -= 0.02;
        
        sparkle.style.left = `${posX}px`;
        sparkle.style.top = `${posY}px`;
        
        if (opacity > 0) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);

      // Clean up DOM element
      setTimeout(() => {
        if (sparkle.parentNode) {
          container.removeChild(sparkle);
        }
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <style jsx global>{`
        @keyframes sparkle-fade {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          20% {
            transform: scale(1) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.3) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
