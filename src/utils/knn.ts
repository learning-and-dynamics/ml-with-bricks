interface Point {
  x: number;
  y: number;
}

interface LabeledPoint extends Point {
  label: string;
}

export const knnPredict = (
  dataPoints: LabeledPoint[],
  gridLimits: GridLimits,
  newPoint: Point,
  k: number
) => {
  if (dataPoints.length === 0) {
    return { prediction: "undecided", neighbors: [] };
  }

  const { xMin, xMax, yMin, yMax } = gridLimits;

  // Compute normalized distances
  const distances = dataPoints.map((point) => {
    const distance = Math.sqrt(
      Math.pow((point.x - newPoint.x) / (xMax - xMin), 2) +
        Math.pow((point.y - newPoint.y) / (yMax - yMin), 2)
    );
    return { ...point, distance };
  });

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  // Take the k nearest neighbors
  const kNearestNeighbors = distances.slice(0, k);

  // Count label frequencies
  const labelCounts: Record<string, number> = {};
  kNearestNeighbors.forEach((neighbor) => {
    if (neighbor.label) {
      labelCounts[neighbor.label] = (labelCounts[neighbor.label] || 0) + 1;
    }
  });

  // Determine the most frequent label
  const sortedLabels = Object.entries(labelCounts).sort(
    ([, countA], [, countB]) => countB - countA
  );

  if (sortedLabels.length === 0) {
    // No labels among neighbors
    return { prediction: "undecided", neighbors: kNearestNeighbors };
  }

  const maxCount = sortedLabels[0][1];
  const tiedLabels = sortedLabels.filter(([, count]) => count === maxCount);

  let prediction = "";
  if (tiedLabels.length > 1) {
    prediction = "undecided";
  } else {
    prediction = sortedLabels[0][0];
  }

  // Return both prediction and neighbors
  return {
    prediction,
    neighbors: kNearestNeighbors,
  };
};

interface GridLimits {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export const getKNNGrid = (
  dataPoints: LabeledPoint[],
  gridLimits: GridLimits,
  gridSize: number,
  k: number
) => {
  const { xMin, xMax, yMin, yMax } = gridLimits;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myDictionary: string[][] = [];

  [...Array(gridSize).keys()].forEach((i) => {
    const x = xMin + (i * (xMax - xMin)) / (gridSize - 1);
    myDictionary[i] = [];
    [...Array(gridSize).keys()].forEach((j) => {
      const y = yMin + (j * (yMax - yMin)) / (gridSize - 1);
      myDictionary[i][j] = knnPredict(dataPoints, gridLimits, { x, y }, k).prediction;
    });
  });

  return myDictionary;
};
