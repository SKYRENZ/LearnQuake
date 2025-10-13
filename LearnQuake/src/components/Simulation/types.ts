export interface SelectedSimulationEvent {
  place?: string;
  mag?: number;
  time?: number;
  url?: string;
}

export interface NominatimResult {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
  class?: string;
  type?: string;
  importance?: number;
}