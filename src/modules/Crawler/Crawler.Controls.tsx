import styled from "styled-components";
import SegmentControl, {
  Segment,
} from "../../components/Inputs/SegmentedControl";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button/Button";
import { PauseIcon, PlayIcon, RestartIcon } from "../../components/Icons/Icons";
import Typography from "../../components/Typography/Typography";
import SwitchInput from "../../components/Inputs/SwitchInput";
import { CrawlerActionType } from "../../types/types";

interface Props {
  explorationModes: Segment[];
  currentExplorationMode: string;
  handleExplorationModeChange(newExplorationMode: string): void;
  waitBeforeNextMove: boolean;
  handleWaitBeforeNextMoveChange(): void;
  thinkFuture: boolean;
  handleThinkFutureChange(): void;
  handleContinue(): void;
  handlePause(): void;
  handleReset(): void;
  actionType: CrawlerActionType | null;
}

const CrawlerControls = ({
  waitBeforeNextMove,
  handleWaitBeforeNextMoveChange,
  explorationModes,
  currentExplorationMode,
  handleExplorationModeChange,
  handleContinue,
  handlePause,
  handleReset,
  actionType,
  thinkFuture,
  handleThinkFutureChange,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Typography.Text>{t("Crawler.controls")}</Typography.Text>
      <ButtonRow>
        <Button onClick={handleContinue} icon={<PlayIcon />} />
        <Button onClick={handlePause} icon={<PauseIcon />} />
        <Button onClick={handleReset} icon={<RestartIcon />} />
      </ButtonRow>
      {/* <SegmentControl
        segments={crawlerModes}
        currentId={currentMode}
        handleSelectOption={handleModeChange}
        label={t("modeLabel")}
      /> */}
      <SwitchInput
        text={t("Crawler.modeLabel")}
        value={waitBeforeNextMove}
        handleChange={handleWaitBeforeNextMoveChange}
      />
      <SwitchInput
        text={t("Crawler.thinkFutureLabel")}
        value={thinkFuture}
        handleChange={handleThinkFutureChange}
      />
      <SegmentControl
        segments={explorationModes}
        currentId={currentExplorationMode}
        handleSelectOption={handleExplorationModeChange}
        label={t("Crawler.explorationLabel")}
      />
      <Typography.Text>{t("Crawler.actionTypeLabel")}</Typography.Text>
      <ActionTypesWrapper>
        <ActionTypeBlock $active={actionType === "exploitation"}>
          <Typography.Text>{t("Crawler.actionType.exploitation")}</Typography.Text>
          <ActionImageWrapper
            style={{ backgroundImage: "url(crawler/exploitation.png)" }}
          />
        </ActionTypeBlock>
        <ActionTypeBlock $active={actionType === "exploration"}>
          <Typography.Text>{t("Crawler.actionType.exploration")}</Typography.Text>
          <ActionImageWrapper
            style={{ backgroundImage: "url(crawler/exploration.png)" }}
          />
        </ActionTypeBlock>
      </ActionTypesWrapper>
    </Wrapper>
  );
};

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  width: 100%;
`;

const Wrapper = styled.div`
  width: 100%;
  padding: 0 5px 30px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  & > p {
    font-weight: 600;
  }
  grid-area: c;
`;

const ActionTypesWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 50px;
  width: 100%;
  padding: 10px 0;
`;

const ActionTypeBlock = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  & > p {
    font-weight: 700;
    text-align: center;
    font-size: 16px;
  }

  transition: all 0.3s ease-in;

  & div {
    filter: ${({ $active }) => (!$active ? "grayscale(100%)" : "none")};
  }
  padding: 0 10px 5px;
  border-radius: 5px;
  ${({ $active }) =>
    $active
      ? `
transform: scale(1.1);
border: 2px solid black;
  `
      : `
transform: scale(0.9);
border: 0px solid black;
  `};
`;

const ActionImageWrapper = styled.div`
  height: 100px;
  width: 100%;
  align-self: center;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`;

export default CrawlerControls;
