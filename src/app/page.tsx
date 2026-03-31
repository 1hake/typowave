"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Visualizer from "@/components/Visualizer";
import AdminPanel from "@/components/AdminPanel";
import { AudioEngine } from "@/lib/audio-engine";
import { TypowaveConfig, loadConfig, saveConfig } from "@/lib/config";

export default function Home() {
  const [config, setConfig] = useState<TypowaveConfig | null>(null);
  const [showAdmin, setShowAdmin] = useState(true);
  const [audioActive, setAudioActive] = useState(false);
  const [currentBpm, setCurrentBpm] = useState(0);
  const [beatFlash, setBeatFlash] = useState(false);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const configRef = useRef<TypowaveConfig | null>(null);
  const sceneIndexRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    configRef.current = config;
    if (config) sceneIndexRef.current = config.activeSceneIndex;
  }, [config]);

  useEffect(() => {
    setConfig(loadConfig());
    audioEngineRef.current = new AudioEngine();
    return () => {
      audioEngineRef.current?.stop();
    };
  }, []);

  const handleConfigChange = useCallback((newConfig: TypowaveConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  }, []);

  const navigateScene = useCallback(
    (dir: 1 | -1) => {
      if (!config) return;
      const total = config.scenes.length;
      const next = (config.activeSceneIndex + dir + total) % total;
      handleConfigChange({ ...config, activeSceneIndex: next });
    },
    [config, handleConfigChange]
  );

  // Beat callback — wired once, reads from refs to avoid stale closures
  useEffect(() => {
    const engine = audioEngineRef.current;
    if (!engine) return;

    const unsubscribe = engine.onBeat((bpm, beatCount) => {
      setCurrentBpm(bpm);

      // Flash indicator
      setBeatFlash(true);
      setTimeout(() => setBeatFlash(false), 80);

      const cfg = configRef.current;
      if (!cfg || !cfg.beatTransition) return;

      // Transition every N beats
      if (beatCount % cfg.beatsPerTransition === 0 && beatCount > 0) {
        const total = cfg.scenes.length;
        const next = (sceneIndexRef.current + 1) % total;
        sceneIndexRef.current = next;
        setConfig((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, activeSceneIndex: next };
          saveConfig(updated);
          return updated;
        });
      }
    });

    return unsubscribe;
  }, [audioActive]); // re-subscribe when audio starts/stops

  // Sync beat threshold to engine
  useEffect(() => {
    if (config && audioEngineRef.current) {
      audioEngineRef.current.setBeatThreshold(config.beatThreshold);
    }
  }, [config?.beatThreshold]);

  const handleStartMic = useCallback(async () => {
    const engine = audioEngineRef.current;
    if (!engine) return;
    try {
      await engine.startMicrophone();
      setAudioActive(true);
    } catch {
      alert("Could not access microphone.");
    }
  }, []);

  const handleStartSystem = useCallback(async () => {
    const engine = audioEngineRef.current;
    if (!engine) return;
    try {
      await engine.startSystemAudio();
      setAudioActive(true);
    } catch {
      alert("Could not capture system audio. Share a tab with audio enabled.");
    }
  }, []);

  const handleStopAudio = useCallback(() => {
    audioEngineRef.current?.stop();
    audioEngineRef.current = new AudioEngine();
    setAudioActive(false);
    setCurrentBpm(0);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          setShowAdmin((v) => !v);
          break;
        case "KeyF":
          e.preventDefault();
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateScene(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateScene(-1);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigateScene]);

  // Timer-based auto transition (fallback if not using beat)
  useEffect(() => {
    if (!config?.autoTransition || config.beatTransition) return;
    const interval = setInterval(() => {
      navigateScene(1);
    }, config.transitionInterval * 1000);
    return () => clearInterval(interval);
  }, [config?.autoTransition, config?.beatTransition, config?.transitionInterval, navigateScene]);

  // Update audio engine smoothing
  useEffect(() => {
    if (config && audioEngineRef.current) {
      audioEngineRef.current.setSmoothing(config.smoothing);
    }
  }, [config?.smoothing]);

  if (!config) return null;

  const activeScene = config.scenes[config.activeSceneIndex];

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <Visualizer
        scene={activeScene}
        audioEngine={audioEngineRef.current}
        sensitivity={config.sensitivity}
      />

      {/* Beat flash overlay */}
      {beatFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-opacity"
          style={{
            backgroundColor: activeScene.textColor,
            opacity: 0.03,
          }}
        />
      )}

      {/* BPM + Scene indicator */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-3">
        {currentBpm > 0 && (
          <span
            className="text-[11px] font-mono uppercase tracking-wider opacity-30 tabular-nums"
            style={{ color: activeScene.textColor }}
          >
            {currentBpm} BPM
          </span>
        )}
        <div className="flex items-center gap-1.5">
          {config.scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => handleConfigChange({ ...config, activeSceneIndex: i })}
              className={`w-1 h-1 rounded-full transition-all ${
                i === config.activeSceneIndex
                  ? "bg-current scale-[2]"
                  : "bg-current opacity-15"
              }`}
              style={{ color: activeScene.textColor }}
            />
          ))}
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-wider opacity-15"
          style={{ color: activeScene.textColor }}
        >
          {activeScene.name}
        </span>
      </div>

      {/* Admin toggle */}
      <button
        onClick={() => setShowAdmin((v) => !v)}
        className="fixed top-4 right-4 z-50 w-7 h-7 flex items-center justify-center rounded text-[11px] font-mono transition hover:opacity-100 opacity-30"
        style={{ color: activeScene.textColor }}
      >
        {showAdmin ? "\u2715" : "\u2630"}
      </button>

      {showAdmin && (
        <AdminPanel
          config={config}
          onChange={handleConfigChange}
          onClose={() => setShowAdmin(false)}
          audioActive={audioActive}
          onStartMic={handleStartMic}
          onStartSystem={handleStartSystem}
          onStopAudio={handleStopAudio}
          currentBpm={currentBpm}
        />
      )}

      {/* Hint */}
      {!audioActive && !showAdmin && (
        <div className="fixed inset-0 flex items-end justify-center pb-4 pointer-events-none z-30">
          <p
            className="text-[10px] font-mono uppercase tracking-wider opacity-15"
            style={{ color: activeScene.textColor }}
          >
            Space: controls &middot; F: fullscreen &middot;
            &larr;&rarr;: scenes
          </p>
        </div>
      )}
    </main>
  );
}
