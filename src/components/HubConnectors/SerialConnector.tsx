import { useState } from "react";
import styled from "styled-components";
import Button from "../Button/Button";
import { useSerial } from "../../contexts/SerialContext";
import { useTranslation } from "react-i18next";
import {
  LinkIcon,
  LinkOffIcon,
  PlayIcon,
  SettingsIcon,
  StopIcon,
} from "../Icons/Icons";
// import { CodeReplacement } from "../../types/types";

interface Props {
  experimentName: string;
  onScriptLaunch: () => Promise<any>;
  onSettingsOpen?: () => void;
  // codeReplacements?: CodeReplacement[];
}

const SerialConnector = ({
  experimentName,
  onScriptLaunch,
  onSettingsOpen,
}: Props) => {
  const { connect, disconnect, portState, codeStatus, startCode, stopCode } =
    useSerial();

  const [codeUploadProgress, setCodeUploadProgress] = useState<
    number | undefined
  >(0);

  const { t } = useTranslation();

  const handleConnectClick = () => {
    console.log("portState", portState);
    if (portState === "open") disconnect();
    else if (portState === "closed") connect();
  };

  const handleRunCode = () => {
    if (portState !== "open") return;
    if (codeStatus === "off")
      startCode({
        slotId: 8,
        experimentName,
        name: experimentName,
        onProgress: (pct) => setCodeUploadProgress(pct),
        onStart: onScriptLaunch,
      });
    if (codeStatus === "on") stopCode();
  };

  return (
    <Wrapper>
      <ButtonsBlock>
        <Button
          onClick={handleConnectClick}
          text={t(`HubInteraction.portState.${portState}`)}
          icon={
            (portState === "closed" && <LinkIcon />) ||
            (portState === "open" && <LinkOffIcon />)
          }
          loading={["closing", "opening"].includes(portState)}
        />
        {portState === "open" && (
          <Button
            onClick={handleRunCode}
            text={codeStatus === "on" ? t("HubInteraction.stopCode") : t("HubInteraction.launchCode")}
            icon={
              (codeStatus === "off" && <PlayIcon />) ||
              (codeStatus === "on" && <StopIcon />)
            }
            loading={codeStatus === "uploading"}
            loadingProgress={codeUploadProgress}
            // loading={true}
            // loadingProgress={60}
          />
        )}
      </ButtonsBlock>
      {!!onSettingsOpen && codeStatus === "off" && (
        <Button onClick={onSettingsOpen} icon={<SettingsIcon />} />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  column-gap: 10px;
  margin: 20px 0;
  justify-content: space-between;
  align-items: center;
`;

const ButtonsBlock = styled.div`
  display: flex;
  column-gap: 10px;
  align-items: center;
`;

export default SerialConnector;
