import { LRData } from "../types/types";

export const calculateRegressionLoss = (
  dataPoints: LRData[],
  m: number,
  b: number
) => {
  const totalError = dataPoints.reduce((sum, dp) => {
    const predicted = m * dp.distance + b;
    return sum + Math.pow(dp.power - predicted, 2);
  }, 0);
  return (totalError / dataPoints.length || 0).toFixed(2);
};

export const calculateBestRegressionCoefficients = (
  dataPoints: LRData[]
) => {
  const n = dataPoints.length;
  if (n < 2) {
    return { slope: 0, intercept: 0 }; // Not enough data points for regression
  }

  // Sum of distances and powers
  const sumX = dataPoints.reduce((sum, dp) => sum + dp.distance, 0);
  const sumY = dataPoints.reduce((sum, dp) => sum + dp.power, 0);

  // Sum of distances squared and distances * powers
  const sumX2 = dataPoints.reduce(
    (sum, dp) => sum + dp.distance * dp.distance,
    0
  );
  const sumXY = dataPoints.reduce((sum, dp) => sum + dp.distance * dp.power, 0);

  // Calculate slope (m) and intercept (b)
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  return { m: Math.round(m * 100) / 100, b: Math.round(b * 100) / 100 };
};
