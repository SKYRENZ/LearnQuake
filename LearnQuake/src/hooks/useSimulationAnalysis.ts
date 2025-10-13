import { useCallback, useRef, useState } from 'react';
import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import type Polygon from 'ol/geom/Polygon';
import { toLonLat } from 'ol/proj';

export interface AIImpactData {
  estimated_casualties?: string;
  estimated_injured?: string;
  damaged_infrastructure?: string;
  tsunami_risk?: string;
  landslide_risk?: string;
}

export interface AISimulationAnalysis {
  circle?: {
    center?: [number, number];
    radius_km?: number | string;
  };
  impact?: AIImpactData;
  [key: string]: unknown;
}

export interface HoveredSimulationMeta {
  place?: string;
  magnitude?: number;
  radiusKm?: number;
  pending?: boolean;
  error?: string | null;
}

export function useSimulationAnalysis(mapEndpoint: string, simPlace: string) {
  const [isSimAnalyzing, setIsSimAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hoveredSimAnalysis, setHoveredSimAnalysis] =
    useState<AISimulationAnalysis | null>(null);
  const [hoveredSimMeta, setHoveredSimMeta] =
    useState<HoveredSimulationMeta | null>(null);
  const [simSummaryMeta, setSimSummaryMeta] =
    useState<HoveredSimulationMeta | null>(null);
  const [simSummaryAnalysis, setSimSummaryAnalysis] =
    useState<AISimulationAnalysis | null>(null);
  const hoveredSimFeatureRef = useRef<Feature<Geometry> | null>(null);

  const requestSimulationAnalysis = useCallback(
    async (
      coverageFeature: Feature<Polygon>,
      coord3857: [number, number],
      magnitude: number,
      radiusKm: number
    ) => {
      const placeLabel = simPlace || 'Custom Location';

      setIsSimAnalyzing(true);
      setAnalysisError(null);
      coverageFeature.set('analysisPending', true);
      coverageFeature.set('analysis', null);
      coverageFeature.set('analysisError', null);
      setSimSummaryMeta(prev =>
        prev
          ? { ...prev, pending: true, error: null }
          : {
              place: placeLabel,
              magnitude,
              radiusKm,
              pending: true,
              error: null,
            }
      );
      setSimSummaryAnalysis(null);

      try {
        const [lon, lat] = toLonLat(coord3857);
        const resolvedEndpoint = mapEndpoint || '/.netlify/functions/map';
        const res = await fetch(resolvedEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place: placeLabel,
            magnitude,
            areaCoverage: radiusKm,
            coordinates: [lon, lat],
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const payload = (await res.json()) as {
          analysis?: AISimulationAnalysis;
        };

        if (payload?.analysis) {
          coverageFeature.set('analysis', payload.analysis);
          setSimSummaryAnalysis(payload.analysis);
          setSimSummaryMeta(prev =>
            prev
              ? { ...prev, pending: false, error: null }
              : {
                  place: placeLabel,
                  magnitude,
                  radiusKm,
                  pending: false,
                  error: null,
                }
          );
        } else {
          coverageFeature.set('analysisError', 'No AI analysis returned.');
          setAnalysisError('AI did not return analysis.');
          setSimSummaryMeta(prev =>
            prev
              ? { ...prev, pending: false, error: 'No AI analysis returned.' }
              : null
          );
        }
      } catch (err) {
        console.error('Failed to fetch AI analysis', err);
        coverageFeature.set('analysisError', 'Failed to fetch AI analysis.');
        setAnalysisError('Failed to fetch AI analysis.');
        setSimSummaryMeta(prev =>
          prev
            ? { ...prev, pending: false, error: 'Failed to fetch AI analysis.' }
            : null
        );
      } finally {
        coverageFeature.set('analysisPending', false);
        if (hoveredSimFeatureRef.current === coverageFeature) {
          const radiusMeters =
            (coverageFeature.get('radius') as number | undefined) ?? undefined;
          setHoveredSimMeta({
            place:
              (coverageFeature.get('place') as string | undefined) ??
              'Simulated Event',
            magnitude: coverageFeature.get('mag') as number | undefined,
            radiusKm: radiusMeters ? radiusMeters / 1000 : undefined,
            pending: coverageFeature.get('analysisPending') as boolean | undefined,
            error:
              (coverageFeature.get('analysisError') as string | undefined) ?? null,
          });
          setHoveredSimAnalysis(
            (coverageFeature.get('analysis') as AISimulationAnalysis | null) ?? null
          );
        }
        setIsSimAnalyzing(false);
      }
    },
    [mapEndpoint, simPlace]
  );

  return {
    isSimAnalyzing,
    analysisError,
    hoveredSimAnalysis,
    hoveredSimMeta,
    simSummaryMeta,
    simSummaryAnalysis,
    setHoveredSimMeta,
    setHoveredSimAnalysis,
    setSimSummaryMeta,
    setSimSummaryAnalysis,
    requestSimulationAnalysis,
    hoveredSimFeatureRef,
  };
}

export type {
  AISimulationAnalysis as SimulationAnalysis,
  HoveredSimulationMeta as SimulationMeta,
};