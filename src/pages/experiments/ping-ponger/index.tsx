"use client";

import styled from "styled-components";
import Typography from "../../../components/Typography/Typography";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS } from "chart.js";
import PingPongerDiagram from "../../../modules/PingPonger/PingPonger.Diagram";
import SegmentControl from "../../../components/Inputs/SegmentedControl";
import { modelModes } from "../../../consts/consts";
import PingPongerTable from "../../../modules/PingPonger/PingPonger.Table";
import { LRData, PingpongerSettings, TunnelData } from "../../../types/types";
import Button from "../../../components/Button/Button";
import "katex/dist/katex.min.css";
import {
  FlyingBallIcon,
  FunctionIcon,
  RulerIcon,
  SendIcon,
} from "../../../components/Icons/Icons";
import SliderInput from "../../../components/Inputs/SliderInput";
import Latex from "react-latex-next";
import {
  calculateBestRegressionCoefficients,
  calculateRegressionLoss,
} from "../../../utils/lr";
import { toast } from "react-toastify";
import PingpongerSettingsPopup from "../../../components/Popups/PingpongerSettingsPopup";
import { getLocalStorageValue } from "../../../utils/localStorage";
import BLEConnector from "../../../components/HubConnectors/BLEConnector";
import experimentCodes from "../../../utils/experimentCodes";
import { useBLE } from "../../../contexts/BLEContext";
import PitcherInstructions from "../../../modules/PingPonger/PingPonger.Instructions";

// --------------------------------------
// Example mock data (commented out by default).
// const mockRegressionData: LRData[] = [
//   { id: "0", power: 20, distance: 10 },
//   { id: "1", power: 40, distance: 24 },
// ];
// // --------------------------------------
const mockRegressionData: LRData[] = []; // empty by default.

const defaultSettings: PingpongerSettings = {
  distanceSensorPort: "F",
  leftMotorPort: "A",
  rightMotorPort: "B",
  isInverted: true,
};

const PingPongerPage = () => {
  const { t } = useTranslation();
  const { sendTunnelData, subscribe } = useBLE();

  const chartRef = useRef<ChartJS<"scatter"> | null>(null);

  // --------------------------------------
  // 2. Use localStorage for state initialization
  // --------------------------------------
  const [data, setData] = useState<LRData[]>(() =>
    getLocalStorageValue("pingPonger_data", mockRegressionData)
  );
  const [modelMode, setModelMode] = useState<string>(() =>
    getLocalStorageValue("pingPonger_modelMode", "train")
  );
  const [inferDistance, setInferDistance] = useState<number | null>(() =>
    getLocalStorageValue("pingPonger_inferDistance", null)
  );
  const [currentPower, setCurrentPower] = useState<number>(() =>
    getLocalStorageValue("pingPonger_currentPower", 20)
  );
  const [newPower, setNewPower] = useState<number>(() =>
    getLocalStorageValue("pingPonger_newPower", 20)
  );
  const [isBestParameters, setIsBestParameters] = useState<boolean>(() =>
    getLocalStorageValue("pingPonger_isBestParameters", false)
  );
  const [m, setM] = useState<number>(() =>
    getLocalStorageValue("pingPonger_m", 1)
  );
  const [b, setB] = useState<number>(() =>
    getLocalStorageValue("pingPonger_b", -10)
  );

  const [settingsPopupActive, setSettingsPopupActive] =
    useState<boolean>(false);

  const [pingpongerSettings, setPingpongerSettings] =
    useState<PingpongerSettings>(defaultSettings);

  const loss = useMemo(() => calculateRegressionLoss(data, m, b), [m, b, data]);

  // --------------------------------------
  // 3. Persist changes to localStorage
  // --------------------------------------

  // --------------------------------------
  // Handlers
  // --------------------------------------
  const handleTableRowHover = (datapointId: string | null) => {
    if (!datapointId) {
      chartRef.current?.setActiveElements([]);
    } else {
      chartRef.current?.setActiveElements([
        { datasetIndex: 0, index: data.findIndex((v) => v.id === datapointId) },
      ]);
    }
    chartRef.current?.update("none");
  };

  const handlePitchBall = () => {
    sendTunnelData({
      action: "pitch_ball",
      payload: {},
    });
  };

  const handleMeasureDistance = () => {
    sendTunnelData({
      action: "measure_distance",
      payload: {},
    });
  };

  const handleRemoveData = (datapointId: string) => {
    setData((prev) => prev.filter((el) => el.id !== datapointId));
    sendTunnelData({
      action: "delete_datapoint",
      payload: { id: datapointId },
    });
  };

  const handleCodeStart = async () => {
    subscribe(tunnelMessageListener);
    sendTunnelData({
      action: "code_start",
      payload: {
        datapoints: data,
        mode: modelMode,
        power: currentPower,
        infer_distance: inferDistance,
      },
    }).then(() =>
      toast.success(t("PingPonger.toasts.codeStarted"), {
        position: "bottom-left",
      })
    );
  };

  const handleModelModeChange = (newModeId: string) => {
    // Example: ensure we have at least 2 data points before inference
    if (newModeId === "infer" && data.length < 2) {
      toast.warn(t("PingPonger.toasts.min2Points"), {
        position: "bottom-left",
      });
      return;
    }
    setModelMode(newModeId);
    setInferDistance(null);
    sendTunnelData({
      action: "change_mode",
      payload: { mode: newModeId },
    });
  };

  const handleUpdateMotorPower = (e: any) => {
    e.preventDefault();
    setCurrentPower(newPower);

    sendTunnelData({
      action: "change_power",
      payload: { power: newPower },
    });
  };

  const setBestParameters = () => {
    const { m: bestM, b: bestB } = calculateBestRegressionCoefficients(data);
    if (bestM !== undefined && bestB !== undefined) {
      setM(bestM);
      setB(bestB);
      setIsBestParameters(true);
    }
  };

  const handleChangeM = (v: number) => {
    setM(v);
    setIsBestParameters(false);
  };

  const handleChangeB = (v: number) => {
    setB(v);
    setIsBestParameters(false);
  };

  // --------------------------------------
  // Spike event handler
  // --------------------------------------

  const tunnelMessageListener = (data: TunnelData) => {
    const messageData = data.payload;

    switch (data.action) {
      case "add_point":
        const newPoint: LRData = {
          id: messageData.id,
          power: messageData.power,
          distance: messageData.distance,
        };
        setData((prev) => [...prev, newPoint]);
        break;
      case "infer_distance":
        setInferDistance(() => messageData.distance);
        break;
      default:
        break;
    }
  };

  const code = useMemo(
    () => experimentCodes.pitcher(pingpongerSettings),
    [pingpongerSettings]
  );

  // If user wants to keep best parameters in sync with new data, re-calc on data changes
  useEffect(() => {
    if (isBestParameters) {
      setBestParameters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    localStorage.setItem("pingPonger_data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("pingPonger_modelMode", JSON.stringify(modelMode));
  }, [modelMode]);

  useEffect(() => {
    localStorage.setItem(
      "pingPonger_inferDistance",
      JSON.stringify(inferDistance)
    );
  }, [inferDistance]);

  useEffect(() => {
    localStorage.setItem(
      "pingPonger_currentPower",
      JSON.stringify(currentPower)
    );
  }, [currentPower]);

  useEffect(() => {
    localStorage.setItem("pingPonger_newPower", JSON.stringify(newPower));
  }, [newPower]);

  useEffect(() => {
    localStorage.setItem(
      "pingPonger_isBestParameters",
      JSON.stringify(isBestParameters)
    );
  }, [isBestParameters]);

  useEffect(() => {
    localStorage.setItem("pingPonger_m", JSON.stringify(m));
  }, [m]);

  useEffect(() => {
    localStorage.setItem("pingPonger_b", JSON.stringify(b));
  }, [b]);

  // --------------------------------------
  // Derived values
  // --------------------------------------

  // --------------------------------------
  // Render
  // --------------------------------------

  const CrawlerCommandBlock = () => (
    <Row>
      <ButtonWrapper>
        <Button
          text={t("PingPonger.launch")}
          icon={<FlyingBallIcon />}
          onClick={handlePitchBall}
        />
      </ButtonWrapper>
      <ButtonWrapper>
        <Button
          text={t("PingPonger.measure")}
          icon={<RulerIcon />}
          onClick={handleMeasureDistance}
        />
      </ButtonWrapper>
    </Row>
  );

  return (
    <Wrapper>
      <Typography.H1>{t("PingPonger.title")}</Typography.H1>
      <PitcherInstructions />
      {/* Spike Connector */}
      <BLEConnector
        code={code}
        onStart={handleCodeStart}
        // onSettingsOpen={() => setSettingsPopupActive(true)}
        // codeReplacements={codeReplacements}
      />

      <DiagramRow>
        {/* Left Column: Diagram */}
        <div>
          <PingPongerDiagram
            chartRef={chartRef}
            isInfer={modelMode === "infer"}
            regressionData={data}
            m={m}
            b={b}
            inferDistance={inferDistance}
          />
        </div>

        {/* Right Column: Controls & Table */}
        <ControlsColumn>
          <SegmentControl
            currentId={modelMode}
            segments={modelModes.map((el) => ({
              id: el,
              text: t(`PingPonger.modelModes.${el}` as any),
            }))}
            handleSelectOption={handleModelModeChange}
          />
          <CrawlerCommandBlock />

          {modelMode === "infer" ? (
            <ControlsWrapper>
              <Row>
                <Typography.H3>
                  {t("PingPonger.linearRegression")}
                </Typography.H3>
                <Button
                  text={t("PingPonger.calculateBest")}
                  icon={<FunctionIcon />}
                  onClick={setBestParameters}
                  active={data.length >= 2}
                />
              </Row>
              {/* 
              <Center className="bigKatex">
                <Latex>
                  {`$v = m \\cdot d + b = ${m.toFixed(2)}\\cdot d ${b < 0 ? "-" : "+"
                    } ${Math.abs(b).toFixed(2)}$`}
                </Latex>
              </Center> */}

              <SlidersRow>
                <SliderInput
                  value={m}
                  label={t("PingPonger.parameters.slope")}
                  minValue={-3}
                  maxValue={3}
                  onChange={handleChangeM}
                  stepDevisor={100}
                  writeValue
                />
                <SliderInput
                  value={b}
                  label={t("PingPonger.parameters.intercept")}
                  minValue={-10}
                  maxValue={50}
                  onChange={handleChangeB}
                  stepDevisor={100}
                  writeValue
                />
              </SlidersRow>

              <Center>
                <Latex>{`$${t("PingPonger.loss")} = ${loss}$`}</Latex>
              </Center>
            </ControlsWrapper>
          ) : (
            <ControlsWrapper>
              <SelectPowerForm>
                <SliderInput
                  value={newPower}
                  label={`${t(
                    "PingPonger.power"
                  )}: ${currentPower}% → ${newPower}%`}
                  minValue={20}
                  maxValue={100}
                  onChange={(v) => setNewPower(v)}
                />
                <Button
                  text={t("PingPonger.sendNewPower")}
                  icon={<SendIcon />}
                  onClick={handleUpdateMotorPower}
                  type="submit"
                />
              </SelectPowerForm>
            </ControlsWrapper>
          )}

          <PingPongerTable
            data={data}
            handleRemoveData={handleRemoveData}
            handleTableRowHover={handleTableRowHover}
          />
        </ControlsColumn>
      </DiagramRow>
      <PingpongerSettingsPopup
        active={settingsPopupActive}
        handleClose={() => setSettingsPopupActive(false)}
        pingpongerSettings={pingpongerSettings}
        setPingpongerSettings={setPingpongerSettings}
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

  .bigKatex .katex {
    font-size: 24px;
  }

  .katex {
    font-size: 20px;
  }

  @media (max-width: 1024px) {
    column-gap: 10px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    row-gap: 20px;
  }
`;

const ControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
`;

const SelectPowerForm = styled.form`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 10px 0;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  & > button {
    flex: 1 !important;
  }
`;

const ControlsColumn = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 20px;
`;

const SlidersRow = styled(Row)``;

const Center = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
`;

// --------------------------------------
// Disable SSR for this page:
export default PingPongerPage;
