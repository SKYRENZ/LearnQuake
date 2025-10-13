import { useState } from 'react';

interface UseFrequencyControlsReturn {
  frequencyMin: string;
  frequencyMax: string;
  setFrequencyMin: React.Dispatch<React.SetStateAction<string>>;
  setFrequencyMax: React.Dispatch<React.SetStateAction<string>>;
  errorMin: boolean;
  errorMax: boolean;
  setErrorMin: React.Dispatch<React.SetStateAction<boolean>>; // Add this
  setErrorMax: React.Dispatch<React.SetStateAction<boolean>>; // Add this
  noise: number;
  setNoise: (noise: number) => void;
  handleFrequencyChange: (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
}

export const useFrequencyControls = (): UseFrequencyControlsReturn => {
  const [frequencyMin, setFrequencyMin] = useState('0.1');
  const [frequencyMax, setFrequencyMax] = useState('10.0');
  const [errorMin, setErrorMin] = useState(false);
  const [errorMax, setErrorMax] = useState(false);
  const [noise, setNoise] = useState(10);

  const handleFrequencyChange = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setValue(value);
      setError(false);
    } else {
      setValue(value);
      setError(true);
    }
  };

  return {
    frequencyMin,
    frequencyMax,
    setFrequencyMin,
    setFrequencyMax,
    errorMin,
    errorMax,
    setErrorMin, // Add this
    setErrorMax, // Add this
    noise,
    setNoise,
    handleFrequencyChange,
  };
};