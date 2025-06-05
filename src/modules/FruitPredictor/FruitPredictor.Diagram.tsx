import React, { useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ChartData,
  ScatterController,
  LinearScale,
  PointElement,
  LineElement,
  Plugin,
  ChartDataset,
  Filler,
} from "chart.js";
import { getKNNGrid, knnPredict } from "../../utils/knn";
import { useTranslation } from "react-i18next";
import { FruitStyle, KNNData, KNNInferData } from "../../types/types";

ChartJS.register(
  ScatterController,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

const gridLimits = {
  xMin: 0,
  xMax: 1024,
  yMin: 0,
  yMax: 20,
};

// Extend the Chart.js Dataset type to include custom fields
declare module "chart.js" {
  interface _ScatterControllerDatasetOptions {
    emoji: string | null;
    emojiFont?: string;
    customFill?: boolean;
    customFillColor?: string;
  }
}

interface Props {
  k: number;
  fruitStyles: Record<string, FruitStyle>;
  fruitData: KNNData[];
  inferDatapoint?: KNNInferData;
  showDecisionBorder: boolean;
  chartRef: React.MutableRefObject<ChartJS<"scatter"> | null>;
}

const Diagram = ({
  k,
  fruitStyles,
  fruitData,
  inferDatapoint,
  showDecisionBorder,
  chartRef,
}: Props) => {
  const { t } = useTranslation();
  const gridSize = 100;

  const transformedData = useMemo(
    () =>
      fruitData.map((el) => ({
        x: el.color[1],
        y: el.length,
        label: el.label,
      })),
    [fruitData]
  );

  const labeledGrid = useMemo(() => {
    if (!showDecisionBorder) return null;
    return getKNNGrid(transformedData, gridLimits, gridSize, k);
  }, [showDecisionBorder, transformedData, k]);

  // Create an offscreen bitmap for the decision border only when labeledGrid, fruitStyles, or k changes
  const decisionBorderBitmap = useMemo(() => {
    if (!labeledGrid) return null;

    // Create an offscreen canvas of size gridSize x gridSize
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = gridSize;
    offscreenCanvas.height = gridSize;
    const offCtx = offscreenCanvas.getContext("2d");
    if (!offCtx) return null;

    // Draw each cell of the grid onto the offscreen canvas
    // Note: We'll consider the top-left corner as (0,0) and flip the y-axis as needed.
    for (let xIx = 0; xIx < gridSize; xIx++) {
      for (let yIx = 0; yIx < gridSize; yIx++) {
        const lbl = labeledGrid[xIx][yIx];
        offCtx.fillStyle = fruitStyles[lbl].fillColor;
        // The grid is indexed from top=0 to bottom=gridSize-1, while Chart y goes bottom->top.
        // We'll flip so that row 0 corresponds to top of the offscreen canvas.
        offCtx.fillRect(xIx, gridSize - 1 - yIx, 1, 1);
      }
    }

    return offscreenCanvas;
  }, [labeledGrid, fruitStyles]);

  const getInferPlotObject = (inferDp: KNNInferData) => {
    const transformedInferDatapoint = {
      x: inferDp.color[1],
      y: inferDp.length,
    };
    const { neighbors, prediction } = knnPredict(
      transformedData,
      gridLimits,
      transformedInferDatapoint,
      k
    );
    const linesData = neighbors.flatMap((el) => [
      {
        x: transformedInferDatapoint.x,
        y: transformedInferDatapoint.y,
        emoji: null,
      },
      { x: el.x, y: el.y, emoji: null },
    ]);

    return [
      {
        label: "lines",
        data: linesData,
        showLine: true,
        pointRadius: 0,
        borderColor: "#080808",
      },
      {
        label: "infer",
        data: [
          {
            x: transformedInferDatapoint.x,
            y: transformedInferDatapoint.y,
            emoji: fruitStyles[prediction].emoji,
          },
        ],
        showLine: false,
        pointRadius: 0,
      },
    ];
  };
  const data: ChartData<
    "scatter",
    { x: number; y: number; emoji: string | null }[]
  > = useMemo(() => {
    return {
      datasets: [
        {
          label: "fruits",
          data: fruitData.map((el) => ({
            x: el.color[1],
            y: el.length,
            emoji: fruitStyles[el.label].emoji || null,
          })),
          showLine: false,
          pointRadius: 0,
          pointBackgroundColor: "rgb(112, 112, 112)",
          pointHoverRadius: 20,
          pointHoverBackgroundColor: "rgba(112, 112, 112, 0.5)",
        },
        ...(!!inferDatapoint ? getInferPlotObject(inferDatapoint) : []),
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fruitData, fruitStyles, inferDatapoint, k, transformedData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = useMemo(() => {
    return {
      aspectRatio: 1,
      responsive: true,
      maintainAspectRatio: true,
      events: [],
      layout: {
        padding: {
          right: 10,
        },
      },
      scales: {
        x: {
          min: gridLimits.xMin,
          max: gridLimits.xMax,
          ticks: {
            display: false,
          },
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: t("FruitPredictor.xAxisTitle"),
            padding: { top: 30 },
            font: {
              size: 16,
            },
          },
        },
        y: {
          min: gridLimits.yMin,
          max: gridLimits.yMax,
          title: {
            display: true,
            text: t("FruitPredictor.yAxisTitle"),
            font: {
              size: 16,
            },
          },
        },
      },
      animation: false,
      plugins: {
        decision_border_plugin: {
          decisionBorderBitmap,
          fruitStyles: fruitStyles,
          show: showDecisionBorder,
        },
      },
    };
  }, [t, decisionBorderBitmap, fruitStyles, showDecisionBorder]);

  return (
    <Scatter
      id="fruit-predictor-scatter"
      ref={chartRef}
      data={data}
      options={options}
      plugins={[
        emojiPlugin,
        gradientScalePlugin,
        decisionBorderPlugin,
        lastGridLinePlugin,
      ]}
    />
  );
};

export default Diagram;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const gradientScalePlugin: Plugin<"scatter"> = {
  id: "gradient_scale_plugin",
  afterDraw: (chart) => {
    const { ctx, scales } = chart;

    const xScale = scales.x;
    const yScale = scales.y;

    // Create a horizontal gradient from left to right
    const gradient = ctx.createLinearGradient(
      xScale.left,
      yScale.bottom,
      xScale.right,
      yScale.bottom
    );
    gradient.addColorStop(0, "rgb(255, 0, 0)");
    gradient.addColorStop(1, "rgb(255, 255, 0)");

    const rectX = xScale.left;
    const rectY = yScale.bottom + 10;
    const rectWidth = xScale.width;
    const rectHeight = 20;
    const borderRadius = 5; // adjust radius as desired

    ctx.save();
    ctx.fillStyle = gradient;

    // Draw a rounded rectangle path
    drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, borderRadius);

    // Fill with gradient
    ctx.fill();

    // Stroke with black color
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },
};

const emojiPlugin: Plugin<"scatter"> = {
  id: "emojiPlugin",
  afterDatasetsDraw: (chart) => {
    const { ctx, data } = chart;

    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      const scatterDataset = dataset as ChartDataset<
        "scatter",
        { x: number; y: number; emoji?: string }[]
      >;

      const font = "20px sans-serif";
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      scatterDataset.data.forEach((point, pointIndex) => {
        const { emoji } = point;
        const element = meta.data[pointIndex];
        if (emoji && element) {
          const { x: xPixel, y: yPixel } = element;
          ctx.fillText(emoji, xPixel, yPixel);
        }
      });

      ctx.restore();
    });
  },
};

// Define a plugin to draw filled polygons before datasets are drawn
const decisionBorderPlugin: Plugin<"scatter"> = {
  id: "decision_border_plugin",
  beforeDraw(chart, _args, pluginOptions) {
    const { ctx, scales } = chart;
    const show: boolean = pluginOptions?.show;
    const decisionBorderBitmap = pluginOptions?.decisionBorderBitmap;
    if (!show || !decisionBorderBitmap) return;

    const { x, y } = scales;
    // Draw the pre-rendered bitmap scaled to the chart area
    // We drew a gridSize x gridSize image. Now we scale it to xScale.width by yScale.height.
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(decisionBorderBitmap, x.left, y.top, x.width, y.height);
    ctx.restore();
  },
};

const lastGridLinePlugin: Plugin<"scatter"> = {
  id: "lastGridLinePlugin",
  beforeDatasetsDraw(chart) {
    const {
      ctx,
      scales: { x, y },
    } = chart;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x.getPixelForValue(x.max), y.top);
    ctx.lineTo(x.getPixelForValue(x.max), y.bottom);
    // Use the same stroke style as other grid lines or customize as needed
    ctx.strokeStyle = "#e6e6e6";
    ctx.stroke();
    ctx.restore();
  },
};
