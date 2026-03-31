"use client";

import { useState } from "react";
import {
  TypowaveConfig,
  Scene,
  TextBlock,
  AudioBand,
  ReactProperty,
  AudioReaction,
  createDefaultBlock,
  PRESET_SCENES,
  makeBlockId,
  generateRandomScene,
  generateSceneBatch,
} from "@/lib/config";

interface AdminPanelProps {
  config: TypowaveConfig;
  onChange: (config: TypowaveConfig) => void;
  onClose: () => void;
  audioActive: boolean;
  onStartMic: () => void;
  onStartSystem: () => void;
  onStopAudio: () => void;
  currentBpm: number;
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-black/10 pb-3 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
      >
        {title}
        <span className="text-black/30">{open ? "\u2212" : "+"}</span>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="min-w-[80px] text-black/50">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-black h-1"
      />
      <span className="w-8 text-right font-mono text-[10px] text-black/30">
        {value}
      </span>
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between text-[11px]">
      <span className="text-black/50">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded border border-black/10 bg-transparent cursor-pointer"
        />
        <span className="font-mono text-[10px] text-black/30">{value}</span>
      </div>
    </label>
  );
}

const BANDS: AudioBand[] = ["bass", "mids", "highs", "volume"];
const PROPERTIES: ReactProperty[] = [
  "scale",
  "letterSpacing",
  "opacity",
  "x",
  "y",
  "blur",
  "rotate",
];

function BlockEditor({
  block,
  onChange,
  onDelete,
}: {
  block: TextBlock;
  onChange: (b: TextBlock) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const update = (partial: Partial<TextBlock>) =>
    onChange({ ...block, ...partial });

  const updateReaction = (index: number, partial: Partial<AudioReaction>) => {
    const reactions = [...block.reactions];
    reactions[index] = { ...reactions[index], ...partial };
    update({ reactions });
  };

  const addReaction = () => {
    update({
      reactions: [
        ...block.reactions,
        { band: "bass", property: "scale", intensity: 0.5 },
      ],
    });
  };

  const removeReaction = (index: number) => {
    update({ reactions: block.reactions.filter((_, i) => i !== index) });
  };

  return (
    <div className="border border-black/10 rounded p-2 text-[11px]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 text-left font-mono text-[10px] truncate"
        >
          {block.text.split("\n")[0].slice(0, 20)}
          {block.text.length > 20 ? "\u2026" : ""}
          <span className="text-black/30 ml-2">
            {block.fontSize}px
          </span>
        </button>
        <button
          onClick={onDelete}
          className="text-black/30 hover:text-red-500 ml-2 text-xs"
        >
          \u00d7
        </button>
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            value={block.text}
            onChange={(e) => update({ text: e.target.value })}
            className="w-full bg-black/5 rounded px-2 py-1 text-[11px] font-mono resize-none border-0"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] text-black/50">
              X %
              <input
                type="number"
                value={block.x}
                onChange={(e) => update({ x: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black/5 rounded px-1.5 py-0.5 font-mono text-[10px]"
              />
            </label>
            <label className="text-[10px] text-black/50">
              Y %
              <input
                type="number"
                value={block.y}
                onChange={(e) => update({ y: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black/5 rounded px-1.5 py-0.5 font-mono text-[10px]"
              />
            </label>
          </div>
          <Slider
            label="Size"
            value={block.fontSize}
            min={8}
            max={300}
            step={1}
            onChange={(v) => update({ fontSize: v })}
          />
          <Slider
            label="Weight"
            value={block.fontWeight}
            min={100}
            max={900}
            step={100}
            onChange={(v) => update({ fontWeight: v })}
          />
          <Slider
            label="Spacing"
            value={block.letterSpacing}
            min={-0.1}
            max={0.5}
            step={0.01}
            onChange={(v) => update({ letterSpacing: v })}
          />
          <Slider
            label="Line H."
            value={block.lineHeight}
            min={0.7}
            max={2.5}
            step={0.05}
            onChange={(v) => update({ lineHeight: v })}
          />
          <Slider
            label="Opacity"
            value={block.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => update({ opacity: v })}
          />
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-[10px] text-black/50">
              <select
                value={block.fontFamily}
                onChange={(e) =>
                  update({ fontFamily: e.target.value as "sans" | "mono" })
                }
                className="bg-black/5 rounded px-1 py-0.5 text-[10px]"
              >
                <option value="sans">Sans</option>
                <option value="mono">Mono</option>
              </select>
            </label>
            <label className="flex items-center gap-1 text-[10px] text-black/50">
              <select
                value={block.textTransform}
                onChange={(e) =>
                  update({
                    textTransform: e.target.value as
                      | "none"
                      | "uppercase"
                      | "lowercase",
                  })
                }
                className="bg-black/5 rounded px-1 py-0.5 text-[10px]"
              >
                <option value="none">Normal</option>
                <option value="uppercase">UPPER</option>
                <option value="lowercase">lower</option>
              </select>
            </label>
            <ColorInput
              label=""
              value={block.color}
              onChange={(v) => update({ color: v })}
            />
          </div>

          {/* Audio Reactions */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                Reactions
              </span>
              <button
                onClick={addReaction}
                className="text-[10px] text-black/40 hover:text-black"
              >
                + Add
              </button>
            </div>
            {block.reactions.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-1 mb-1"
              >
                <select
                  value={r.band}
                  onChange={(e) =>
                    updateReaction(i, { band: e.target.value as AudioBand })
                  }
                  className="bg-black/5 rounded px-1 py-0.5 text-[10px] w-16"
                >
                  {BANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <span className="text-black/20">&rarr;</span>
                <select
                  value={r.property}
                  onChange={(e) =>
                    updateReaction(i, {
                      property: e.target.value as ReactProperty,
                    })
                  }
                  className="bg-black/5 rounded px-1 py-0.5 text-[10px] w-20"
                >
                  {PROPERTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={r.intensity}
                  onChange={(e) =>
                    updateReaction(i, {
                      intensity: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 accent-black h-0.5"
                />
                <button
                  onClick={() => removeReaction(i)}
                  className="text-black/20 hover:text-red-500 text-[10px]"
                >
                  \u00d7
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({
  config,
  onChange,
  onClose,
  audioActive,
  onStartMic,
  onStartSystem,
  onStopAudio,
  currentBpm,
}: AdminPanelProps) {
  const activeScene = config.scenes[config.activeSceneIndex];

  const updateConfig = (partial: Partial<TypowaveConfig>) => {
    onChange({ ...config, ...partial });
  };

  const updateScene = (partial: Partial<Scene>) => {
    const scenes = [...config.scenes];
    scenes[config.activeSceneIndex] = { ...activeScene, ...partial };
    updateConfig({ scenes });
  };

  const updateBlock = (blockId: string, updated: TextBlock) => {
    updateScene({
      blocks: activeScene.blocks.map((b) => (b.id === blockId ? updated : b)),
    });
  };

  const deleteBlock = (blockId: string) => {
    updateScene({
      blocks: activeScene.blocks.filter((b) => b.id !== blockId),
    });
  };

  const addBlock = () => {
    updateScene({
      blocks: [
        ...activeScene.blocks,
        createDefaultBlock({ color: activeScene.textColor }),
      ],
    });
  };

  const duplicateScene = () => {
    const newScene: Scene = {
      ...activeScene,
      id: `scene_${Date.now()}`,
      name: `${activeScene.name} Copy`,
      blocks: activeScene.blocks.map((b) => ({ ...b, id: makeBlockId() })),
    };
    const scenes = [...config.scenes, newScene];
    updateConfig({ scenes, activeSceneIndex: scenes.length - 1 });
  };

  const deleteScene = () => {
    if (config.scenes.length <= 1) return;
    const scenes = config.scenes.filter(
      (_, i) => i !== config.activeSceneIndex
    );
    updateConfig({
      scenes,
      activeSceneIndex: Math.min(config.activeSceneIndex, scenes.length - 1),
    });
  };

  const resetToPresets = () => {
    onChange({
      ...config,
      scenes: [...PRESET_SCENES],
      activeSceneIndex: 0,
    });
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[320px] bg-[#fafafa]/95 backdrop-blur-xl border-l border-black/10 overflow-y-auto z-50 text-black">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em]">
            Typowave
          </h2>
          <button
            onClick={onClose}
            className="text-black/30 hover:text-black text-sm"
          >
            \u00d7
          </button>
        </div>

        {/* Audio */}
        <Section title="Audio Source">
          <div className="flex gap-2">
            {!audioActive ? (
              <>
                <button
                  onClick={onStartMic}
                  className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded bg-black text-white hover:bg-black/80 transition"
                >
                  Microphone
                </button>
                <button
                  onClick={onStartSystem}
                  className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded border border-black/20 hover:bg-black/5 transition"
                >
                  System
                </button>
              </>
            ) : (
              <button
                onClick={onStopAudio}
                className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded bg-black text-white hover:bg-black/80 transition"
              >
                Stop
              </button>
            )}
          </div>
        </Section>

        {/* BPM Display */}
        {currentBpm > 0 && (
          <div className="border-b border-black/10 pb-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[28px] font-mono font-bold tabular-nums">{currentBpm}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">BPM</span>
            </div>
          </div>
        )}

        {/* Beat Transition */}
        <Section title="Beat Sync">
          <label className="flex items-center justify-between text-[11px] cursor-pointer">
            <span className="text-black/50">Change scene on beat</span>
            <div
              onClick={() => updateConfig({ beatTransition: !config.beatTransition })}
              className={`w-8 h-4 rounded-full relative transition-colors ${config.beatTransition ? "bg-black" : "bg-black/15"}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${config.beatTransition ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </label>
          {config.beatTransition && (
            <>
              <Slider
                label="Beats/trans."
                value={config.beatsPerTransition}
                min={1}
                max={64}
                step={1}
                onChange={(v) => updateConfig({ beatsPerTransition: v })}
              />
              <Slider
                label="Threshold"
                value={config.beatThreshold}
                min={1.1}
                max={3}
                step={0.05}
                onChange={(v) => updateConfig({ beatThreshold: v })}
              />
              <p className="text-[9px] text-black/25 mt-1">
                Lower threshold = more sensitive beat detection. Transition every {config.beatsPerTransition} beat{config.beatsPerTransition > 1 ? "s" : ""}.
              </p>
            </>
          )}
        </Section>

        {/* Global */}
        <Section title="Global">
          <Slider
            label="Sensitivity"
            value={config.sensitivity}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(v) => updateConfig({ sensitivity: v })}
          />
          <Slider
            label="Smoothing"
            value={config.smoothing}
            min={0}
            max={0.99}
            step={0.01}
            onChange={(v) => updateConfig({ smoothing: v })}
          />
        </Section>

        {/* Scenes */}
        <Section title="Scenes">
          <div className="flex flex-wrap gap-1 mb-2">
            {config.scenes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => updateConfig({ activeSceneIndex: i })}
                className={`px-2 py-1 text-[10px] font-mono rounded transition ${
                  i === config.activeSceneIndex
                    ? "bg-black text-white"
                    : "bg-black/5 hover:bg-black/10"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                const newScene = generateRandomScene();
                const scenes = [...config.scenes, newScene];
                updateConfig({ scenes, activeSceneIndex: scenes.length - 1 });
              }}
              className="px-2 py-1 text-[10px] font-bold text-black/60 hover:text-black bg-black/5 rounded"
            >
              + Random
            </button>
            <button
              onClick={() => {
                const batch = generateSceneBatch(10);
                const scenes = [...config.scenes, ...batch];
                updateConfig({ scenes });
              }}
              className="px-2 py-1 text-[10px] text-black/40 hover:text-black bg-black/5 rounded"
            >
              + 10 Random
            </button>
            <button
              onClick={duplicateScene}
              className="px-2 py-1 text-[10px] text-black/40 hover:text-black bg-black/5 rounded"
            >
              Duplicate
            </button>
            <button
              onClick={deleteScene}
              className="px-2 py-1 text-[10px] text-black/40 hover:text-red-500 bg-black/5 rounded"
            >
              Delete
            </button>
            <button
              onClick={resetToPresets}
              className="px-2 py-1 text-[10px] text-black/40 hover:text-black bg-black/5 rounded"
            >
              Reset All
            </button>
          </div>
        </Section>

        {/* Active Scene */}
        <Section title={`Scene: ${activeScene.name}`}>
          <label className="block text-[11px]">
            <input
              type="text"
              value={activeScene.name}
              onChange={(e) => updateScene({ name: e.target.value })}
              className="w-full bg-black/5 rounded px-2 py-1 font-mono text-[11px]"
            />
          </label>
          <ColorInput
            label="Background"
            value={activeScene.bgColor}
            onChange={(v) => updateScene({ bgColor: v })}
          />
          <ColorInput
            label="Default Text"
            value={activeScene.textColor}
            onChange={(v) => updateScene({ textColor: v })}
          />
        </Section>

        {/* Text Blocks */}
        <Section title={`Blocks (${activeScene.blocks.length})`}>
          <div className="space-y-1.5">
            {activeScene.blocks.map((block) => (
              <BlockEditor
                key={block.id}
                block={block}
                onChange={(updated) => updateBlock(block.id, updated)}
                onDelete={() => deleteBlock(block.id)}
              />
            ))}
          </div>
          <button
            onClick={addBlock}
            className="w-full mt-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded border border-dashed border-black/20 hover:bg-black/5 transition"
          >
            + Add Block
          </button>
        </Section>

        <p className="text-[9px] text-black/20 text-center mt-4 font-mono">
          SPACE toggle &middot; F fullscreen &middot; &larr;&rarr; scenes
        </p>
      </div>
    </div>
  );
}
