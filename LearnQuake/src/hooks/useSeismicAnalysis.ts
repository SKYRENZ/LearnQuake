import { useMemo } from 'react';

interface EarthquakeData {
  id: string;
  magnitude: number;
  place: string;
  time: Date;
  depth: number;
  latitude: number;
  longitude: number;
}

interface TimeSeriesData {
  time: number;
  amplitude: number;
  frequency: number;
}

interface SpectralData {
  fft: { frequency: number; amplitude: number }[];
  spectrogram: { frequency: number; amplitude: number }[];
}

interface UseSeismicAnalysisReturn {
  timeSeriesData: TimeSeriesData[];
  spectralData: SpectralData;
  createTimeSeriesPath: (data: TimeSeriesData[], width: number, height: number) => string;
  createSpectralPath: (data: { frequency: number; amplitude: number }[], width: number, height: number) => string;
}

export const useSeismicAnalysis = (
  selectedEarthquake: EarthquakeData | null,
  frequencyMin: string,
  frequencyMax: string,
  noise: number
): UseSeismicAnalysisReturn => {

  // Generate time series data based on selected earthquake
  const generateTimeSeriesData = (earthquake: EarthquakeData | null): TimeSeriesData[] => {
    if (!earthquake) {
      // Default data when no earthquake is selected
      return Array.from({ length: 100 }, (_, i) => ({
        time: i,
        amplitude: Math.sin(i * 0.1) * 50 + Math.random() * (noise / 2) - (noise / 4),
        frequency: 1.0
      }));
    }

    const dataPoints = 200;
    const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
    const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const t = i / 10; // Time in seconds
      
      // Create seismic wave pattern based on earthquake properties
      const primaryWave = Math.sin(t * baseFreq * 2 * Math.PI) * earthquake.magnitude * 10;
      const secondaryWave = Math.sin(t * (baseFreq * 1.7) * 2 * Math.PI) * earthquake.magnitude * 7;
      const surfaceWave = Math.sin(t * (baseFreq * 0.8) * 2 * Math.PI) * earthquake.magnitude * 15;
      
      // Depth affects wave amplitude (deeper = more attenuated)
      const depthFactor = Math.exp(-earthquake.depth / 100);
      
      // Distance effect simulation
      const distanceDecay = Math.exp(-t * 0.1);
      
      // Combine waves with noise
      const amplitude = (primaryWave + secondaryWave + surfaceWave) * depthFactor * distanceDecay;
      const noiseComponent = (Math.random() - 0.5) * (noise / 5);
      
      return {
        time: t,
        amplitude: amplitude + noiseComponent,
        frequency: baseFreq + (Math.random() * (maxFreq - baseFreq))
      };
    });
  };

  // Generate spectral analysis data based on selected earthquake
  const generateSpectralData = (earthquake: EarthquakeData | null): SpectralData => {
    if (!earthquake) {
      // Default spectral data when no earthquake is selected
      return {
        fft: Array.from({ length: 50 }, (_, i) => ({
          frequency: i * 0.4,
          amplitude: Math.random() * 50 + 10
        })),
        spectrogram: Array.from({ length: 50 }, (_, i) => ({
          frequency: i * 0.4,
          amplitude: Math.random() * 80 + 20
        }))
      };
    }

    const baseFreq = Math.max(0.1, parseFloat(frequencyMin) || 0.1);
    const maxFreq = Math.min(20.0, parseFloat(frequencyMax) || 10.0);
    const freqRange = maxFreq - baseFreq;
    
    // Generate FFT data based on earthquake properties
    const fftData = Array.from({ length: 50 }, (_, i) => {
      const freq = baseFreq + (i / 49) * freqRange;
      
      // Main frequency components based on earthquake characteristics
      let amplitude = 0;
      
      // Primary wave frequency (higher frequency, magnitude dependent)
      const pWaveFreq = baseFreq * 2;
      if (Math.abs(freq - pWaveFreq) < 1) {
        amplitude += earthquake.magnitude * 15;
      }
      
      // Secondary wave frequency (medium frequency)
      const sWaveFreq = baseFreq * 1.2;
      if (Math.abs(freq - sWaveFreq) < 0.8) {
        amplitude += earthquake.magnitude * 12;
      }
      
      // Surface wave frequency (lower frequency, highest amplitude)
      const surfaceWaveFreq = baseFreq * 0.7;
      if (Math.abs(freq - surfaceWaveFreq) < 0.5) {
        amplitude += earthquake.magnitude * 20;
      }
      
      // Depth effect - deeper earthquakes have different frequency distribution
      const depthFactor = Math.exp(-earthquake.depth / 200);
      amplitude *= depthFactor;
      
      // Add some background noise
      amplitude += Math.random() * (earthquake.magnitude * 2);
      
      return {
        frequency: freq,
        amplitude: Math.max(0, amplitude)
      };
    });

    // Generate Spectrogram data (time-frequency representation)
    const spectrogramData = Array.from({ length: 50 }, (_, i) => {
      const freq = baseFreq + (i / 49) * freqRange;
      
      let amplitude = 0;
      
      // Different frequency patterns over time
      const timePhase = (i / 50) * Math.PI * 2;
      
      // Lower frequencies dominate early (surface waves arrive later)
      if (freq < baseFreq * 2) {
        amplitude += earthquake.magnitude * 18 * Math.sin(timePhase + Math.PI);
      }
      
      // Higher frequencies appear first (P-waves)
      if (freq > baseFreq * 1.5) {
        amplitude += earthquake.magnitude * 10 * Math.cos(timePhase);
      }
      
      // Magnitude scaling
      amplitude *= (earthquake.magnitude / 7); // Normalize to typical earthquake range
      
      // Depth effect
      const depthFactor = Math.exp(-earthquake.depth / 150);
      amplitude *= depthFactor;
      
      // Add noise
      amplitude += Math.random() * (earthquake.magnitude * 3);
      
      return {
        frequency: freq,
        amplitude: Math.max(0, amplitude)
      };
    });

    return {
      fft: fftData,
      spectrogram: spectrogramData
    };
  };

  // Create SVG path for the time series graph
  const createTimeSeriesPath = (data: TimeSeriesData[], width: number, height: number) => {
    if (data.length === 0) return '';

    const maxAmplitude = Math.max(...data.map(d => Math.abs(d.amplitude)));
    const minAmplitude = -maxAmplitude;
    
    const xScale = (index: number) => (index / (data.length - 1)) * width;
    const yScale = (amplitude: number) => {
      const normalized = (amplitude - minAmplitude) / (maxAmplitude - minAmplitude);
      return height - (normalized * height);
    };

    let path = `M ${xScale(0)} ${yScale(data[0].amplitude)}`;
    
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(data[i].amplitude)}`;
    }
    
    return path;
  };

  // Create SVG path for spectral analysis
  const createSpectralPath = (data: { frequency: number; amplitude: number }[], width: number, height: number) => {
    if (data.length === 0) return '';

    const maxAmplitude = Math.max(...data.map(d => d.amplitude));
    const minAmplitude = 0;
    
    const xScale = (index: number) => (index / (data.length - 1)) * width;
    const yScale = (amplitude: number) => {
      const normalized = (amplitude - minAmplitude) / (maxAmplitude - minAmplitude);
      return height - (normalized * height);
    };

    let path = `M ${xScale(0)} ${yScale(data[0].amplitude)}`;
    
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(data[i].amplitude)}`;
    }
    
    return path;
  };

  // Generate time series data
  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesData(selectedEarthquake);
  }, [selectedEarthquake, noise, frequencyMin, frequencyMax]);

  // Generate spectral data
  const spectralData = useMemo(() => {
    return generateSpectralData(selectedEarthquake);
  }, [selectedEarthquake, frequencyMin, frequencyMax]);

  return {
    timeSeriesData,
    spectralData,
    createTimeSeriesPath,
    createSpectralPath,
  };
};