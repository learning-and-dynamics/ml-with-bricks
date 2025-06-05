import React, { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ScatterController,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartData,
  Plugin,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { LRData } from "../../types/types";
import { useTheme } from "styled-components";

ChartJS.register(
  ScatterController,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface Props {
  chartRef: React.MutableRefObject<ChartJS<"scatter"> | null>;
  isInfer: boolean;
  regressionData: LRData[];
  m: number;
  b: number;
  inferDistance: null | number;
}

const gridLimits = {
  xMin: 0,
  xMax: 100,
  yMin: 0,
  yMax: 100,
};

const PingPongerDiagram = ({
  chartRef,
  isInfer,
  regressionData,
  m,
  b,
  inferDistance,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const data: ChartData<"scatter"> = useMemo(() => {
    return {
      datasets: [
        {
          label: "points",
          data: regressionData.map((el) => ({ x: el.distance, y: el.power })),
          showLine: false,
          pointRadius: 0,
          pointBackgroundColor: "rgb(5, 0, 153)",
          pointHoverRadius: 15,
          pointHoverBackgroundColor: "rgba(112, 112, 112, 0.5)",
          clip: false,
        },
        ...(isInfer && !!inferDistance
          ? [
              {
                label: "inferLine",
                data: [
                  { x: inferDistance, y: 0 },
                  { x: inferDistance, y: m * inferDistance + b },
                  { x: 0, y: m * inferDistance + b },
                ],
                showLine: true,
                pointRadius: 0,
                borderColor: theme.darkRed,
                borderDash: [6, 3],
              },
            ]
          : []),
        ...(isInfer
          ? [
              {
                label: "line",
                data: [
                  { x: gridLimits.xMin, y: m * gridLimits.xMin + b },
                  { x: gridLimits.xMax, y: m * gridLimits.xMax + b },
                ],
                showLine: true,
                pointRadius: 0,
                borderColor: "#080808",
              },
            ]
          : []),
      ],
    };
  }, [regressionData, isInfer, m, b, inferDistance]);

  const options: any = useMemo(() => {
    return {
      aspectRatio: 1,
      maintainAspectRatio: true,
      events: [],
      layout: {
        padding: {
          right: 10,
          // top: 10,
        },
      },
      scales: {
        x: {
          min: gridLimits.xMin,
          max: gridLimits.xMax,
          title: {
            display: true,
            text: t("PingPonger.xAxisTitle"),
            font: {
              size: 16,
            },
            // padding: { top: 30 },
          },
        },
        y: {
          min: gridLimits.yMin,
          max: gridLimits.yMax,
          title: {
            display: true,
            text: t("PingPonger.yAxisTitle"),
            font: {
              size: 16,
            },
          },
        },
      },
      regressionParams: { m, b, isInfer },
      animation: false,
    };
  }, [t, m, b, isInfer]);

  return (
    <Scatter
      id="fruit-predictor-scatter"
      ref={chartRef}
      data={data}
      options={options}
      plugins={[emojiPlugin, arrowsPlugin]}
    />
  );
};

const emojiPlugin: Plugin<"scatter"> = {
  id: "emojiPlugin",
  afterDatasetsDraw: (chart) => {
    const { ctx, data } = chart;

    for (const datasetIndex in data.datasets) {
      const dataset = data.datasets[datasetIndex];
      const { label } = dataset;

      if (label !== "points" && label !== "inferLine") continue;

      const scatterDataset = dataset;

      const meta = chart.getDatasetMeta(Number(datasetIndex));

      const font = "24px sans-serif";
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      scatterDataset.data.forEach((_, pointIndex) => {
        if (label === "inferLine" && pointIndex !== 1) return;
        const element = meta.data[pointIndex];

        const { x: xPixel, y: yPixel } = element;

        ctx.fillText("🎯", xPixel, yPixel);
      });

      ctx.restore();
    }
  },
};

const arrowsPlugin: Plugin<"scatter"> = {
  id: "arrowsPlugin",
  beforeDatasetDraw: (chart) => {
    const { ctx, data, scales } = chart;
    const { regressionParams } = chart.options as any;
    if (!regressionParams || !regressionParams.isInfer) return;

    const { m, b } = regressionParams;
    const yMin = gridLimits.yMin;
    const yMax = gridLimits.yMax;
    const yScale = scales.y;

    // Find the points dataset
    const pointsDataset = data.datasets.find((d) => d.label === "points");
    if (!pointsDataset) return;
    const pointsMeta = chart.getDatasetMeta(
      data.datasets.indexOf(pointsDataset)
    );
    if (!pointsMeta) return;

    // For each point, draw a dashed line with arrows from actual (x, y) to predicted (x, m*x+b)
    ctx.save();
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = 1;

    pointsDataset.data.forEach((point: any, idx: number) => {
      const element = pointsMeta.data[idx];
      const actualX = element.x;
      const actualY = element.y;

      const xValue = point.x;
      const predictedYValue = m * xValue + b;

      // Clamp predictedYValue to y-axis limits
      let clampedYValue = predictedYValue;
      if (clampedYValue < yMin) {
        clampedYValue = yMin;
      } else if (clampedYValue > yMax) {
        clampedYValue = yMax;
      }

      const clampedY = yScale.getPixelForValue(clampedYValue);

      // Draw the dashed line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(actualX, actualY);
      ctx.lineTo(actualX, clampedY);
      ctx.stroke();

      // Draw arrowheads
      if (clampedYValue === predictedYValue) {
        const arrowHeadLength = 8; // Length of the arrowhead
        const angle = clampedY > actualY ? Math.PI / 2 : -Math.PI / 2; // Determine arrow direction

        // Arrow at the clamped end (predicted point)
        ctx.beginPath();
        ctx.setLineDash([]); // Disable dashes for arrowhead
        ctx.moveTo(actualX, clampedY);
        ctx.lineTo(
          actualX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
          clampedY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(actualX, clampedY);
        ctx.lineTo(
          actualX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
          clampedY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    ctx.restore();
  },
};

export default PingPongerDiagram;
