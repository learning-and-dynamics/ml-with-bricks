import { CrawlerActionStatus, CrawlerMarkovChainMode } from "../../types/types";
import { useEffect, useMemo, useRef } from "react";
import Cytoscape from "cytoscape";
import avsdf from "cytoscape-avsdf";
import { useTheme } from "styled-components";

interface Props {
  qTable: (number | undefined | null)[][];
  rewardsTable: (number | undefined | null)[][];
  currentStateIx: number;
  currentActionIx: number | null;
  actionStatus: CrawlerActionStatus;
  markovChainMode: CrawlerMarkovChainMode;
  epsilon: number;
}

const TransitionDiagram = ({
  qTable,
  rewardsTable,
  currentStateIx,
  currentActionIx,
  actionStatus,
  markovChainMode,
  epsilon,
}: Props) => {
  const theme = useTheme();
  const cyRef = useRef<HTMLDivElement | null>(null);

  const table = useMemo(() => {
    if (markovChainMode === "rewards") return rewardsTable;
    if (markovChainMode === "qTable") return qTable;
    return qTable.map((row, i) => {
      const maxQ = Math.max(
        ...(row.filter((q) => q !== undefined && q !== null) as number[])
      );
      const preferredActionIx = row.findIndex((el) => el === maxQ);
      return row.map((_, j) => {
        if (i === j) return undefined;
        return j == preferredActionIx ? 1 - (2 * epsilon) / 3 : epsilon / 3;
      });
    });
  }, [markovChainMode, qTable, rewardsTable, epsilon]);

  // Register the AVSDF layout
  Cytoscape.use(avsdf);

  const elementsList = useMemo(() => {
    const size = table.length;
    const elements: any[] = [];

    // Create nodes
    for (let i = 0; i < size; i++) {
      elements.push({
        data: {
          id: `n${i}`,
          label: `State ${i}`,
          type: "ellipse",
          bgImage: `crawler/state_${i}.png`,
          active: i === currentStateIx ? "true" : "false",
        },
        grabbable: false, // Prevent user dragging of nodes
      });
    }

    // Create edges
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const weight = table[i][j];
        if (weight !== undefined) {
          elements.push({
            data: {
              id: `e${i}-${j}`,
              source: `n${i}`,
              target: `n${j}`,
              weight:
                weight !== null
                  ? weight
                  : i === currentStateIx && j === currentActionIx
                  ? 0
                  : "?",
              label:
                markovChainMode === "epsilon"
                  ? ""
                  : weight !== null
                  ? weight > 0
                    ? `+${weight}`
                    : `${weight}`
                  : "?",
              active:
                i === currentStateIx && j === currentActionIx
                  ? "true"
                  : "false",
            },
          });
        }
      }
    }

    return elements;
  }, [currentActionIx, currentStateIx, table, markovChainMode]);

  const stylesheet = [
    // Node styling
    {
      selector: "node",
      style: {
        height: 20,
        width: 20,
        "background-color": "#fafafa",
        "background-image": "data(bgImage)",
        "background-fit": "cover",
        // "text-halign": "center",
        // "text-valign": "center",
        "font-size": 8,
        "border-width": 0.2,
        "border-color": "#080808",
        "overlay-opacity": 0,
      },
    },
    {
      selector: `node[active = "true"]`,
      style: {
        height: 22,
        width: 22,
        "background-color": "#ddd",
        "transition-property": "width",
        "transition-duration": 0.2,
        // "transition-timing-function": "ease-in",
      },
    },
    // // Base edge styling
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "control-point-step-size": 10,
        "line-color": "#ddd",
        width: 0.5,
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#ddd",
        "arrow-scale": 0.3,
        label: "data(label)",
        "font-size": 3,
        "font-weight": 700,
        "font-family": "Lato",
        color: "#ddd",
        "text-outline-width": 0.5,
        "text-outline-color": "#fff",
        "overlay-opacity": 0,
      },
    },
    // // Positive weight edges
    {
      selector: "edge[weight > 0]",
      style: {
        "line-color": theme.green,
        "target-arrow-color": theme.green,
        color: theme.green,
      },
    },
    // // Negative weight edges
    {
      selector: "edge[weight < 0]",
      style: {
        "line-color": theme.red,
        "target-arrow-color": theme.red,
        color: theme.red,
      },
    },
    // // Zero weight edges
    {
      selector: "edge[weight = 0]",
      style: {
        "line-color": theme.darkGray,
        "target-arrow-color": theme.darkGray,
        color: theme.darkGray,
      },
    },
    // // Dashed, animated edge for the currentStateIx -> currentActionIx
    {
      selector: `edge[active = "true"]`,
      style: {
        "line-style": "dashed",
        "line-dash-pattern": [2, 1],
        "line-dash-offset": 0, // Will be animated below
        width: 0.75,
        "arrow-scale": 0.5,
        "font-size": 4,
        "text-outline-width": 0.75,
      },
    },
    {
      selector: `edge[active = "true"][weight="?"]`,
      style: {
        "line-color": theme.black,
        "target-arrow-color": theme.black,
        color: theme.black,
      },
    },
    {
      selector: `edge[active = "true"][weight=0]`,
      style: {
        "line-color": theme.black,
        "target-arrow-color": theme.black,
        color: theme.black,
      },
    },
    {
      selector: `edge[active = "true"][weight>0]`,
      style: {
        "line-color": theme.darkGreen,
        "target-arrow-color": theme.darkGreen,
        color: theme.darkGreen,
      },
    },
    {
      selector: `edge[active = "true"][weight<0]`,
      style: {
        "line-color": theme.darkRed,
        "target-arrow-color": theme.darkRed,
        color: theme.darkRed,
      },
    },
  ];

  const cyInstance = useRef<Cytoscape.Core | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!cyRef.current) return;

    cyInstance.current = Cytoscape({
      container: cyRef.current,
      elements: elementsList,
      style: stylesheet,
      layout: {
        name: "avsdf",
      },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      zoom: 1,
    });

    return () => {
      cyInstance.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs only once to initialize Cytoscape

  useEffect(() => {
    if (!cyInstance.current) return;
    const cy = cyInstance.current;

    // Reset previous active elements
    cy.elements('[active="true"]')
      .removeClass("active")
      .data("active", "false");

    // Update active node
    cy.getElementById(`n${currentStateIx}`)
      .addClass("active")
      .data("active", "true");

    // Update active edge
    if (currentActionIx !== null) {
      const activeEdge = cy.getElementById(
        `e${currentStateIx}-${currentActionIx}`
      );
      activeEdge.addClass("active").data("active", "true");

      if (actionStatus === "started") {
        let offset = 0;
        if (animationRef.current) clearInterval(animationRef.current);
        animationRef.current = setInterval(() => {
          offset -= 0.3;
          activeEdge.style("line-dash-offset", offset);
        }, 50);
      }
    }

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [currentStateIx, currentActionIx, actionStatus]); // Runs when state/action index changes

  useEffect(() => {
    if (!cyInstance.current) return;
    const cy = cyInstance.current;

    table.forEach((row, i) => {
      row.forEach((weight, j) => {
        const edge = cy.getElementById(`e${i}-${j}`);
        if (edge) {
          edge.data({
            weight: weight ?? "?",
            label:
              weight !== null && weight !== undefined
                ? weight > 0
                  ? `+${weight}`
                  : `${weight}`
                : "?",
          });
        }
      });
    });
  }, [table]); // Runs only when `table` changes

  return (
    <div
      ref={cyRef}
      style={{
        width: "100%",
        aspectRatio: "1/1",
      }}
    />
  );
};

export default TransitionDiagram;
