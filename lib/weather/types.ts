export interface DailyWeatherForecast {
  date: string;
  minTempC?: number;
  maxTempC?: number;
  condition: string;
  precipitationProbability?: number;
  windSpeedKph?: number;
  humidity?: number;
  alerts?: string[];
}

export interface TripWeatherSummary {
  destination: string;
  forecastSource: "openweather" | "mock" | "seasonal";
  forecastReliability: "high" | "medium" | "low";
  daily: DailyWeatherForecast[];
  summary: string;
  limitations: string[];
}

export interface PackingRecommendations {
  clothing: string[];
  footwear: string[];
  rainGear: string[];
  sunProtection: string[];
  healthAndComfort: string[];
  childOrElderlyNotes: string[];
  destinationSpecificNotes: string[];
}
