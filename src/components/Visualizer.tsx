"use client";

import { useEffect, useRef, useCallback } from "react";
import { AudioEngine } from "@/lib/audio-engine";
import { Scene } from "@/lib/config";

interface VisualizerProps {
  scene: Scene;
  audioEngine: AudioEngine | null;
  sensitivity: number;
}

export default function Visualizer({ scene, audioEngine, sensitivity }: VisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const animFrameRef = useRef<number>(0);

  const animate = useCallback(() => {
    if (audioEngine) {
      audioEngine.update();
    }

    blockRefsMap.current.forEach((el, id) => {
      const block = scene.blocks.find((b) => b.id === id);
      if (!block) return;

      let scaleVal = 1;
      let extraLetterSpacing = 0;
      let opacityVal = block.opacity;
      let translateX = 0;
      let translateY = 0;
      let blurVal = 0;
      let rotateVal = 0;

      if (audioEngine) {
        for (const reaction of block.reactions) {
          const raw = audioEngine.getBand(reaction.band) * sensitivity;
          const val = reaction.invert ? 1 - raw : raw;
          const amount = val * reaction.intensity;

          switch (reaction.property) {
            case "scale":
              scaleVal += amount * 0.3;
              break;
            case "letterSpacing":
              extraLetterSpacing += amount * 0.4; // em
              break;
            case "opacity":
              opacityVal = Math.max(0.05, block.opacity - amount * 0.6 + amount);
              break;
            case "x":
              translateX += (Math.sin(Date.now() * 0.003) * amount * 20);
              break;
            case "y":
              translateY += (Math.cos(Date.now() * 0.002) * amount * 15);
              break;
            case "blur":
              blurVal += amount * 6;
              break;
            case "rotate":
              rotateVal += Math.sin(Date.now() * 0.002) * amount * 5;
              break;
          }
        }
      }

      el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleVal}) rotate(${rotateVal}deg)`;
      el.style.letterSpacing = `${block.letterSpacing + extraLetterSpacing}em`;
      el.style.opacity = String(opacityVal);
      el.style.filter = blurVal > 0.01 ? `blur(${blurVal}px)` : "none";
    });

    animFrameRef.current = requestAnimationFrame(animate);
  }, [audioEngine, scene, sensitivity]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  // Clean up stale refs when scene changes
  useEffect(() => {
    const validIds = new Set(scene.blocks.map((b) => b.id));
    blockRefsMap.current.forEach((_, id) => {
      if (!validIds.has(id)) blockRefsMap.current.delete(id);
    });
  }, [scene]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: scene.bgColor }}
    >
      {scene.blocks.map((block) => (
        <div
          key={block.id}
          ref={(el) => {
            if (el) blockRefsMap.current.set(block.id, el);
            else blockRefsMap.current.delete(block.id);
          }}
          className="absolute will-change-transform"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            fontSize: `${block.fontSize}px`,
            fontWeight: block.fontWeight,
            fontFamily: block.fontFamily === "mono" ? "var(--font-geist-mono), monospace" : "var(--font-geist-sans), Helvetica Neue, Arial, sans-serif",
            letterSpacing: `${block.letterSpacing}em`,
            lineHeight: block.lineHeight,
            textTransform: block.textTransform,
            color: block.color || scene.textColor,
            opacity: block.opacity,
            maxWidth: block.maxWidth ? `${block.maxWidth}%` : undefined,
            whiteSpace: "pre-line",
            transformOrigin: "left top",
          }}
        >
          {block.text}
        </div>
      ))}
    </div>
  );
}
