"use client";

import { useEffect, useRef } from "react";

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; size: number; speed: number; opacity: number; twinkleSpeed: number }[] = [];
    const shootingStars: { x: number; y: number; length: number; speed: number; opacity: number; angle: number; active: boolean }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createStars() {
      const count = Math.floor((canvas!.width * canvas!.height) / 4000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    function createShootingStar() {
      if (Math.random() > 0.995) {
        shootingStars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height * 0.5,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 6,
          opacity: 1,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          active: true,
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Draw stars
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0.2) star.twinkleSpeed *= -1;
        star.opacity = Math.max(0.2, Math.min(1, star.opacity));

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`;
        ctx!.fill();

        // Glow effect for larger stars
        if (star.size > 1.5) {
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          const gradient = ctx!.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          gradient.addColorStop(0, `rgba(100, 150, 255, ${star.opacity * 0.15})`);
          gradient.addColorStop(1, "transparent");
          ctx!.fillStyle = gradient;
          ctx!.fill();
        }
      });

      // Shooting stars
      createShootingStar();
      shootingStars.forEach((ss, i) => {
        if (!ss.active) return;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0 || ss.x > canvas!.width || ss.y > canvas!.height) {
          ss.active = false;
          return;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const gradient = ctx!.createLinearGradient(tailX, tailY, ss.x, ss.y);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(ss.x, ss.y);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      });

      // Remove inactive shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        if (!shootingStars[i].active) shootingStars.splice(i, 1);
      }

      animationId = requestAnimationFrame(animate);
    }

    resize();
    createStars();
    animate();

    window.addEventListener("resize", () => {
      resize();
      stars.length = 0;
      createStars();
    });

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
