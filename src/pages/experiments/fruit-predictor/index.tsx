"use client";

import styled from "styled-components";
import Typography from "../../../components/Typography/Typography";
import { useTranslation } from "react-i18next";
import Diagram from "../../../modules/FruitPredictor/FruitPredictor.Diagram";
import SliderInput from "../../../components/Inputs/SliderInput";
import { useEffect, useMemo, useRef, useState } from "react";
import SwitchInput from "../../../components/Inputs/SwitchInput";
import {
  FruitPredictorSettings,
  FruitStyle,
  KNNData,
  KNNInferData,
  TunnelData,
} from "../../../types/types";
import { Chart as ChartJS } from "chart.js";
import SegmentControl from "../../../components/Inputs/SegmentedControl";
import { modelModes } from "../../../consts/consts";
import Dropdown from "../../../components/DropDown/DropDown";
import { getLocalStorageValue } from "../../../utils/localStorage";
import { toast } from "react-toastify";
import FruitPredictorSettingsPopup from "../../../components/Popups/FruitPredictorSettingsPopup";
import BLEConnector from "../../../components/HubConnectors/BLEConnector";
import experimentCodes from "../../../utils/experimentCodes";
import { useBLE } from "../../../contexts/BLEContext";
import FruitPredictorTable from "../../../modules/FruitPredictor/FruitPredictor.Table";
import FruitPredictorInstructions from "../../../modules/FruitPredictor/FruitPredictor.Instructions";

// --------------------------------------
// Example mock data (commented out):
// const mockRawData: KNNData[] = [
//   { id: "1", color: [639, 257, 294], length: 7, label: "apple" },
//   // ...
// ];
// const mockInferDatapoint = {
//   id: "12",
//   color: [1000, 500, 11],
//   length: 10,
//   label: "undecided",
// };
// --------------------------------------

// 1. Helper to safely get data from localStorage (handles SSR & JSON parse).

const defaultSettings: FruitPredictorSettings = {
  distanceSensorPort: "E",
  colorSensorPort: "F",
};

const FruitPredictorPage = () => {
  const { t } = useTranslation();

  const { sendTunnelData, subscribe } = useBLE();
  const chartRef = useRef<ChartJS<"scatter"> | null>(null);

  // --------------------------------------
  // 2. Use localStorage for state initialization
  // --------------------------------------
  const [k, setK] = useState<number>(() =>
    getLocalStorageValue("fruitPredictor_k", 3)
  );

  const [data, setData] = useState<KNNData[]>(() =>
    getLocalStorageValue("fruitPredictor_data", [])
  );

  const [inferDatapoint, setInferDatapoint] = useState<
    KNNInferData | undefined
  >(() => getLocalStorageValue("fruitPredictor_inferDatapoint", undefined));

  const [showDecisionBorder, setShowDecisionBorder] = useState<boolean>(() =>
    getLocalStorageValue("fruitPredictor_showDecisionBorder", false)
  );

  const [modelMode, setModelMode] = useState<string>(() =>
    getLocalStorageValue("fruitPredictor_modelMode", "train")
  );

  const [hideInfer, setHideInfer] = useState<boolean>(() =>
    getLocalStorageValue("fruitPredictor_hideInfer", false)
  );

  const [currentClass, setCurrentClass] = useState<string>(() =>
    getLocalStorageValue("fruitPredictor_currentClass", "apple")
  );

  const [settingsPopupActive, setSettingsPopupActive] =
    useState<boolean>(false);

  const [fruitPredictorSettings, setFruitPredictorSettings] =
    useState<FruitPredictorSettings>(defaultSettings);

  const fruitStyles: Record<string, FruitStyle> = useMemo(
    () => ({
      apple: {
        label: t("FruitPredictor.fruitLabels.apple"),
        emoji: "🍎",
        fillColor: "rgb(253, 143, 143)",
      },
      banana: {
        label: t("FruitPredictor.fruitLabels.banana"),
        emoji: "🍌",
        fillColor: "rgb(255, 241, 134)",
      },
      undecided: {
        label: "Undecided",
        emoji: "❓",
        fillColor: "rgb(192, 192, 192)",
      },
    }),
    [t]
  );

  // --------------------------------------
  // Dropdown options for fruit classes
  // --------------------------------------
  const fruitDropDownOptions = useMemo(() => {
    return Object.entries(fruitStyles)
      .map(([fruitId, fruitStyle]) => ({
        id: fruitId,
        text: `${fruitStyle.emoji} ${fruitStyle.label}`,
      }))
      .filter((el) => el.id !== "undecided");
  }, [fruitStyles]);

  // --------------------------------------
  // 3. Persist changes to localStorage
  // --------------------------------------

  // --------------------------------------
  // Memoized fruit styles
  // --------------------------------------

  // --------------------------------------
  // Handlers for data table
  // --------------------------------------
  const handleRemoveData = (datapointId: string) => {
    setData((prev) => prev.filter((el) => el.id !== datapointId));
    sendTunnelData({
      action: "delete_datapoint",
      payload: { id: datapointId },
    });
  };

  const handleChangeLabel = (datapointId: string, newLabel: string) => {
    setData((prev) =>
      prev.map((el) =>
        el.id !== datapointId ? el : { ...el, label: newLabel }
      )
    );
    sendTunnelData({
      action: "change_datapoint_label",
      payload: { id: datapointId, new_label: newLabel },
    });
  };

  const handleChangeK = (newK: number) => {
    setK(newK);
    sendTunnelData({
      action: "change_k",
      payload: { k: newK },
    });
  };

  const handleCodeStart = async () => {
    subscribe(tunnelMessageListener);
    sendTunnelData({
      action: "startup_functionality",
      payload: {
        class: currentClass,
        class_name: fruitStyles[currentClass].label,
        data: [...data].map((el) => ({
          ...el,
          len: el.length,
          length: undefined,
        })),
        k,
        mode: modelMode,
      },
    }).then(() =>
      toast.success(t("FruitPredictor.toasts.codeStarted"), { position: "bottom-left" })
    );
  };

  const handleTableRowHover = (fruitId: string | null) => {
    if (!fruitId) {
      chartRef.current?.setActiveElements([]);
    } else if (data.findIndex((v) => v.id === fruitId) !== -1) {
      chartRef.current?.setActiveElements([
        { datasetIndex: 0, index: data.findIndex((v) => v.id === fruitId) },
      ]);
    }
    chartRef.current?.update("none");
  };

  const handleCurrentClassSelect = (classId: string) => {
    setCurrentClass(classId);
    sendTunnelData({
      action: "change_class",
      payload: { class: classId, class_name: fruitStyles[classId].label },
    });
  };

  const handleModelModeChange = (newModeId: string) => {
    setInferDatapoint(undefined);
    setModelMode(newModeId);
    sendTunnelData({
      action: "change_mode",
      payload: { mode: newModeId },
    });
  };

  // --------------------------------------
  // Handler for incoming Spike messages
  // --------------------------------------
  const tunnelMessageListener = (data: TunnelData) => {
    const messageData = data.payload;

    switch (data.action) {
      case "add_point":
        const newPoint: KNNData = {
          id: messageData["id"],
          color: messageData["color"].slice(0, 3),
          length: messageData["len"],
          label: messageData["label"],
        };
        setData((prev) => [...prev, newPoint]);
        break;

      case "inference_result":
        const inferPoint: KNNInferData = {
          id: "infer",
          color: messageData["color"],
          length: messageData["len"],
        };
        setInferDatapoint(inferPoint);
        break;
      default:
        break;
    }
  };

  const code = useMemo(() => experimentCodes.fruitPredictor(fruitPredictorSettings), [fruitPredictorSettings]);

  // --------------------------------------
  // Subscribe/unsubscribe to port events
  // --------------------------------------
  useEffect(() => {
    localStorage.setItem("fruitPredictor_k", JSON.stringify(k));
  }, [k]);

  useEffect(() => {
    localStorage.setItem("fruitPredictor_data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(
      "fruitPredictor_inferDatapoint",
      JSON.stringify(
        inferDatapoint === undefined ? "__undefined__" : inferDatapoint
      )
    );
  }, [inferDatapoint]);

  useEffect(() => {
    localStorage.setItem(
      "fruitPredictor_showDecisionBorder",
      JSON.stringify(showDecisionBorder)
    );
  }, [showDecisionBorder]);

  useEffect(() => {
    localStorage.setItem("fruitPredictor_modelMode", JSON.stringify(modelMode));
  }, [modelMode]);

  useEffect(() => {
    localStorage.setItem("fruitPredictor_hideInfer", JSON.stringify(hideInfer));
  }, [hideInfer]);

  useEffect(() => {
    localStorage.setItem(
      "fruitPredictor_currentClass",
      JSON.stringify(currentClass)
    );
  }, [currentClass]);

  // --------------------------------------
  // Render
  // --------------------------------------
  return (
    <Wrapper>
      <Typography.H1>{t("FruitPredictor.title")}</Typography.H1>
      <FruitPredictorInstructions />

      <BLEConnector
        code={code}
        onStart={handleCodeStart}
      />

      <DiagramRow>
        {/* Left Column: Diagram */}
        <div>
          <Diagram
            k={k}
            fruitStyles={fruitStyles}
            fruitData={data}
            inferDatapoint={hideInfer ? undefined : inferDatapoint}
            showDecisionBorder={showDecisionBorder}
            chartRef={chartRef}
          />
        </div>

        {/* Right Column: Controls & Table */}
        <div>
          <SegmentControl
            currentId={modelMode}
            segments={modelModes.map((el) => ({
              id: el,
              text: t(`FruitPredictor.modelModes.${el}` as any),
            }))}
            handleSelectOption={handleModelModeChange}
          />

          {modelMode === "infer" ? (
            <ControlsWrapper>
              <SliderInput
                value={k}
                minValue={1}
                maxValue={17}
                label="K"
                onChange={(v: number) => setK(v)}
                onMouseUp={handleChangeK}
                fullWidth
                writeValue
              />
              <SwitchInput
                text={t("FruitPredictor.showDecisionBorder")}
                value={showDecisionBorder}
                handleChange={(e: any) =>
                  setShowDecisionBorder(e.target.checked)
                }
              />
              <SwitchInput
                text={t("FruitPredictor.hideInfer")}
                value={hideInfer}
                handleChange={(e: any) => setHideInfer(e.target.checked)}
              />
            </ControlsWrapper>
          ) : (
            <ControlsWrapper>
              <SelectClassRow>
                <Typography.Text $bold>{t("FruitPredictor.selectClass")}</Typography.Text>
                <Dropdown
                  options={fruitDropDownOptions}
                  currentOptionId={currentClass}
                  handleOptionSelect={handleCurrentClassSelect}
                  width="auto"
                />
              </SelectClassRow>
            </ControlsWrapper>
          )}

          <FruitPredictorTable
            data={data}
            fruitDropDownOptions={fruitDropDownOptions}
            handleRemoveData={handleRemoveData}
            handleChangeLabel={handleChangeLabel}
            handleTableRowHover={handleTableRowHover}
          />
        </div>
      </DiagramRow>
      <FruitPredictorSettingsPopup
        active={settingsPopupActive}
        handleClose={() => setSettingsPopupActive(false)}
        fruitPredictorSettings={fruitPredictorSettings}
        setFruitPredictorSettings={setFruitPredictorSettings}
      />
    </Wrapper>
  );
};

// --------------------------------------
// Styled components
// --------------------------------------
const Wrapper = styled.div``;

const DiagramRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 30px;

  @media (max-width: 1024px) {
    column-gap: 10px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    row-gap: 20px;
  }

  
`;

const ControlsWrapper = styled.div`
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const SelectClassRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Disable SSR for this page:
export default FruitPredictorPage;
