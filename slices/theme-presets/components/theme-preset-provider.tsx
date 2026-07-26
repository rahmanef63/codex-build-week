"use client";

/** Provider context — thin wrapper around the tweakcn helpers in
 *  lib/tweakcn. Boots persisted preset on first client mount, loads
 *  registry once for the switcher, exposes commit/preview/restore.
 *  Deeply-nested consumers read state via `useThemePreset()` instead
 *  of mounting the switcher themselves.
 *
 *  The host default applies only when the visitor has not made an explicit
 *  local choice. */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import {
  applyTweakcnPreset, bootTweakcnPreset, clearTweakcnPreset,
  getSavedTweakcnPreset, loadTweakcnRegistry, previewTweakcnPreset,
  type TweakcnRegistry,
} from "../lib/tweakcn";

export const DEFAULT_PRESET_NAME = "default";

interface ThemePresetContextValue {
  presetName: string | null;
  registry: TweakcnRegistry | null;
  setPreset: (name: string | null) => void;
  preview: (name: string | null) => void;
  restore: () => void;
  loadRegistry: () => void;
  isReady: boolean;
}

const ThemePresetContext = createContext<ThemePresetContextValue>({
  presetName: null,
  registry: null,
  setPreset: () => {},
  preview: () => {},
  restore: () => {},
  loadRegistry: () => {},
  isReady: false,
});

export function ThemePresetProvider({
  children,
  hostDefault = null,
}: {
  children: ReactNode;
  /** Template's build-time default preset. */
  hostDefault?: string | null;
}) {
  const [registry, setRegistry] = useState<TweakcnRegistry | null>(null);
  const [presetName, setPresetName] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setPresetName(getSavedTweakcnPreset());
    void bootTweakcnPreset()
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  // Apply the host default without persisting when there is no local choice.
  useEffect(() => {
    if (!isReady) return;
    if (getSavedTweakcnPreset()) return;
    if (!hostDefault) return;
    setPresetName(hostDefault);
    void previewTweakcnPreset(hostDefault);
  }, [isReady, hostDefault]);

  const loadRegistry = useCallback(() => {
    if (registry) return;
    void loadTweakcnRegistry().then(setRegistry).catch(() => {});
  }, [registry]);

  const setPreset = useCallback((name: string | null) => {
    if (!name) {
      // Reset = back to the template default (clear the explicit choice).
      clearTweakcnPreset();
      setPresetName(hostDefault);
      if (hostDefault) void previewTweakcnPreset(hostDefault);
      return;
    }
    setPresetName(name);
    void applyTweakcnPreset(name);
  }, [hostDefault]);

  const preview = useCallback((name: string | null) => {
    void previewTweakcnPreset(name);
  }, []);

  const restore = useCallback(() => {
    const saved = getSavedTweakcnPreset();
    const target = saved ?? hostDefault;
    if (target) void previewTweakcnPreset(target);
    else void previewTweakcnPreset(null);
  }, [hostDefault]);

  const value = useMemo<ThemePresetContextValue>(
    () => ({ presetName, registry, setPreset, preview, restore, loadRegistry, isReady }),
    [presetName, registry, setPreset, preview, restore, loadRegistry, isReady],
  );

  return (
    <ThemePresetContext.Provider value={value}>
      {children}
    </ThemePresetContext.Provider>
  );
}

export function useThemePreset(): ThemePresetContextValue {
  return useContext(ThemePresetContext);
}
