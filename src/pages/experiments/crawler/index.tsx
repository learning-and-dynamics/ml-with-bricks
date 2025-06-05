import { useEffect, useMemo, useState } from "react";
import Typography from "../../../components/Typography/Typography";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { getLocalStorageValue } from "../../../utils/localStorage";
import CrawlerTable from "../../../modules/Crawler/Crawler.Table";
import TransitionDiagram from "../../../modules/Crawler/Crawler.TransitionDiagram";
import CrawlerControls from "../../../modules/Crawler/Crawler.Controls";
import { toast } from "react-toastify";
import {
  CrawlerActionStatus,
  CrawlerActionType,
  CrawlerMarkovChainMode,
  CrawlerSettings,
  TunnelData,
} from "../../../types/types";
import CrawlerSettingsPopup from "../../../components/Popups/CrawlerSettingsPopup";
import BLEConnector from "../../../components/HubConnectors/BLEConnector";
import experimentCodes from "../../../utils/experimentCodes";
import { useBLE } from "../../../contexts/BLEContext";
import CrawlerInstructions from "../../../modules/Crawler/Crawler.Instructions";

const defaultSettings: CrawlerSettings = {
  distanceSensorPort: "C",
  bigMotorPort: "D",
  smallMotorPort: "B",
  bigMotorSpeed: 5,
  smallMotorSpeed: 15,
};

const CrawlerPage = () => {
  const { t } = useTranslation();
  const { sendTunnelData, subscribe } = useBLE();

  const movementsNumber = 4;

  const explorationModes = [
    { id: "high", text: t("Crawler.explorations.high"), epsilon: 0.7 },
    { id: "low", text: t("Crawler.explorations.low"), epsilon: 0.3 },
    { id: "no", text: t("Crawler.explorations.no"), epsilon: 0 },
  ];

  const defaultQTable = Array.from({ length: movementsNumber }, (_, i) =>
    Array.from({ length: movementsNumber }, (_, j) => (i === j ? undefined : 0))
  );

  const defaultRewardsTable = Array.from({ length: movementsNumber }, (_, i) =>
    Array.from({ length: movementsNumber }, (_, j) =>
      i === j ? undefined : null
    )
  );

  const defaultExplorationMode = "no";

  const [explorationMode, setExplorationMode] = useState<string>(() =>
    getLocalStorageValue("crawler_epsilonMode", defaultExplorationMode)
  );

  const [thinkFuture, setThinkFuture] = useState<boolean>(() =>
    getLocalStorageValue("crawler_thinkFuture", false)
  );

  const [waitBeforeNextMove, setWaitBeforeNextMove] = useState<boolean>(() =>
    getLocalStorageValue("crawler_waitBeforeNextMove", true)
  );

  const [rewardsTable, setRewardsTable] = useState<
    (number | null | undefined)[][]
  >(() => getLocalStorageValue("crawler_rewardsTable", defaultRewardsTable));

  const [currentStateIx, setCurrentStateIx] = useState<number>(() =>
    getLocalStorageValue("crawler_currentStateIx", 0)
  );

  const [currentActionIx, setCurrentActionIx] = useState<number | null>(null);

  const [settingsPopupActive, setSettingsPopupActive] =
    useState<boolean>(false);

  const markovChainMode: CrawlerMarkovChainMode = "rewards";

  const [actionStatus, setActionStatus] =
    useState<CrawlerActionStatus>("unpicked");

  const [actionType, setActionType] = useState<CrawlerActionType | null>(null);

  const [crawlerSettings, setCrawlerSettings] =
    useState<CrawlerSettings>(defaultSettings);

  const [qTable, setQTable] = useState<(number | undefined)[][]>(() =>
    getLocalStorageValue("crawler_qTable", defaultQTable)
  );

  const handleWaitBeforeNextMoveChange = () => {
    const currentVal = waitBeforeNextMove;
    setWaitBeforeNextMove((prev) => !prev);
    sendTunnelData({
      action: "wait_before_next_move_update",
      payload: {
        wait_before_next_move: !currentVal,
      },
    }).then(() => { });
  };

  const handleThinkFutureChange = () => {
    const currentVal = thinkFuture;
    setThinkFuture((prev) => !prev);
    sendTunnelData({
      action: "think_future_update",
      payload: {
        think_future: !currentVal,
      },
    }).then(() => { });
  };
  const handleExplorationModeChange = (newExplorationMode: string) => {
    setExplorationMode(newExplorationMode);
    sendTunnelData({
      action: "epsilon_update",
      payload: {
        epsilon:
          explorationModes.find((el) => el.id === newExplorationMode)
            ?.epsilon || 0,
      },
    }).then(() => { });
  };

  const handleCodeStart = async () => {
    subscribe(tunnelMessageListener);
    sendTunnelData({
      action: "code_start",
      payload: {
        epsilon:
          explorationModes.find((el) => el.id === explorationMode)?.epsilon ||
          0,
        wait_before_next_move: waitBeforeNextMove,
        current_state: currentStateIx,
        q_table: qTable,
        think_future: thinkFuture,
      },
    }).then(() =>
      toast.success(t("Crawler.toasts.codeStarted"), { position: "bottom-left" })
    );
  };

  const handleContinue = () => {
    sendTunnelData({ action: "continue", payload: {} }).then(() => { });
  };
  const handlePause = () => {
    sendTunnelData({ action: "pause", payload: {} }).then(() => { });
  };
  const handleReset = () => {
    setQTable(defaultQTable);
    setRewardsTable(defaultRewardsTable);
    setActionStatus("unpicked");
    setActionType(null);
    setCurrentActionIx(null);
    setCurrentStateIx(0);
    setWaitBeforeNextMove(false);
    setExplorationMode(defaultExplorationMode);
    setThinkFuture(false);
    sendTunnelData({ action: "reset", payload: {} }).then(() => { });
  };

  const tunnelMessageListener = (data: TunnelData) => {
    const messageData = data.payload;
    switch (data.action) {
      case "action_update":
        setCurrentActionIx(
          messageData.action !== undefined ? messageData.action : null
        );
        if (!!messageData.type) {
          setActionType(messageData.type);
        }
        setActionStatus(messageData.status);
        // code block
        break;
      case "state_update":
        setCurrentStateIx(messageData.state);
        // code block
        break;
      case "too_close":
        toast.warning(t("Crawler.toasts.tooClose"), { position: "bottom-left" });
        break;
      case "too_far":
        toast.warning(t("Crawler.toasts.tooFar"), { position: "bottom-left" });
        break;
      case "tables_update":
        const { action, state, reward, q } = messageData;

        setRewardsTable((prevRewardsTable) => {
          const updatedTable = [...prevRewardsTable];
          if (
            updatedTable[state] &&
            updatedTable[state][action] !== undefined
          ) {
            updatedTable[state][action] = reward;
          }
          return updatedTable;
        });

        setQTable((prevQTable) => {
          const updatedQTable = [...prevQTable];
          if (
            updatedQTable[state] &&
            updatedQTable[state][action] !== undefined
          ) {
            updatedQTable[state][action] = q;
          }
          return updatedQTable;
        });
        break;
      default:
        return;
    }
  };

  const code = useMemo(() => experimentCodes.crawler(crawlerSettings), [crawlerSettings]);

  useEffect(() => {
    localStorage.setItem(
      "crawler_epsilonMode",
      JSON.stringify(explorationMode)
    );
  }, [explorationMode]);

  useEffect(() => {
    localStorage.setItem(
      "crawler_waitBeforeNextMove",
      JSON.stringify(waitBeforeNextMove)
    );
  }, [waitBeforeNextMove]);

  useEffect(() => {
    localStorage.setItem(
      "crawler_rewardsTable",
      JSON.stringify(
        rewardsTable.map((row) =>
          row.map((cell) => (cell === undefined ? "__undefined__" : cell))
        )
      )
    );
  }, [rewardsTable]);

  useEffect(() => {
    localStorage.setItem(
      "crawler_currentStateIx",
      JSON.stringify(currentStateIx)
    );
  }, [currentStateIx]);

  useEffect(() => {
    localStorage.setItem("crawler_thinkFuture", JSON.stringify(thinkFuture));
  }, [thinkFuture]);

  useEffect(() => {
    localStorage.setItem(
      "crawler_qTable",
      JSON.stringify(
        qTable.map((row) =>
          row.map((cell) => (cell === undefined ? "__undefined__" : cell))
        )
      )
    );
  }, [qTable]);

  return (
    <Wrapper>
      <Typography.H1>{t("Crawler.title")}</Typography.H1>
      <CrawlerInstructions  />

      <BLEConnector code={code} onStart={handleCodeStart} />
      <DiagramRow>
        {/* Table */}
        <Box>
          <Typography.Text>{t("Crawler.actionQualityTable")}</Typography.Text>
          <CrawlerTable
            table={qTable}
            currentStateIx={currentStateIx}
            currentActionIx={currentActionIx}
          />
        </Box>

        {/* Markov chain */}
        <Box>
          <Typography.Text>{t("Crawler.rewardDiagram")}</Typography.Text>
          <TransitionDiagram
            rewardsTable={rewardsTable}
            qTable={qTable}
            currentStateIx={currentStateIx}
            currentActionIx={currentActionIx}
            actionStatus={actionStatus}
            markovChainMode={markovChainMode}
            epsilon={
              explorationModes.find((el) => el.id === explorationMode)
                ?.epsilon || 0
            }
          />
        </Box>
        {/* Settings */}
        <CrawlerControls
          waitBeforeNextMove={waitBeforeNextMove}
          handleWaitBeforeNextMoveChange={handleWaitBeforeNextMoveChange}
          explorationModes={explorationModes}
          currentExplorationMode={explorationMode}
          handleExplorationModeChange={handleExplorationModeChange}
          handleContinue={handleContinue}
          handlePause={handlePause}
          handleReset={handleReset}
          actionType={actionType}
          thinkFuture={thinkFuture}
          handleThinkFutureChange={handleThinkFutureChange}
        />
      </DiagramRow>
      <CrawlerSettingsPopup
        active={settingsPopupActive}
        handleClose={() => setSettingsPopupActive(false)}
        crawlerSettings={crawlerSettings}
        setCrawlerSettings={setCrawlerSettings}
      />
    </Wrapper>
  );
};
const Wrapper = styled.div`
  /* overflow: hidden; */
`;

const DiagramRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 20px;
  align-items: start;
  grid-template-areas:
      "a b c";

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "a b"
      "c c";
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "a"
      "b"
      "c";
  }
`;

const Box = styled.div`
  width: 100%;
  & > p {
    font-weight: 600;
  }
`;
export default CrawlerPage;