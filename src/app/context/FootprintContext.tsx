/**
 * Central state for the footprint app. Holds the user profile, derives all
 * heavy aggregations through memoized selectors, and exposes a typed updater.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PROFILE, REGIONAL_BASELINE_RESULT } from "../../utils/baseline";
import { calculateFootprint } from "../../utils/emissionsMath";
import { buildRecommendations } from "../../utils/recommendations";
import type {
  FootprintProfile,
  FootprintResult,
  Recommendation,
} from "../../utils/types";

type Section = keyof FootprintProfile;

interface FootprintContextValue {
  profile: FootprintProfile;
  result: FootprintResult;
  baseline: FootprintResult;
  recommendations: Recommendation[];
  updateSection: <S extends Section>(
    section: S,
    patch: Partial<FootprintProfile[S]>,
  ) => void;
  reset: () => void;
}

const FootprintContext = createContext<FootprintContextValue | null>(null);

export function FootprintProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FootprintProfile>(DEFAULT_PROFILE);

  const updateSection = useCallback(
    <S extends Section>(section: S, patch: Partial<FootprintProfile[S]>) => {
      setProfile((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...patch },
      }));
    },
    [],
  );

  const reset = useCallback(() => setProfile(structuredClone(DEFAULT_PROFILE)), []);

  // Heavy aggregations memoized so rapid slider drags stay performant.
  const result = useMemo(() => calculateFootprint(profile), [profile]);
  const recommendations = useMemo(
    () => buildRecommendations(profile),
    [profile],
  );

  const value = useMemo<FootprintContextValue>(
    () => ({
      profile,
      result,
      baseline: REGIONAL_BASELINE_RESULT,
      recommendations,
      updateSection,
      reset,
    }),
    [profile, result, recommendations, updateSection, reset],
  );

  return (
    <FootprintContext.Provider value={value}>
      {children}
    </FootprintContext.Provider>
  );
}

export function useFootprint(): FootprintContextValue {
  const ctx = useContext(FootprintContext);
  if (!ctx) {
    throw new Error("useFootprint must be used within a FootprintProvider");
  }
  return ctx;
}
