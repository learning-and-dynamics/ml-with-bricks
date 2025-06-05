import React from "react";
import PopupLayout from "../../layouts/PopupLayout";
import Dropdown from "../DropDown/DropDown";
import { ports } from "../../consts/consts";
import { PingpongerSettings } from "../../types/types";
import styled from "styled-components";
import Typography from "../Typography/Typography";
import SwitchInput from "../Inputs/SwitchInput";
import { useTranslation } from "react-i18next";

interface Props {
  active: boolean;
  handleClose: () => void;
  pingpongerSettings: PingpongerSettings;
  setPingpongerSettings: React.Dispatch<
    React.SetStateAction<PingpongerSettings>
  >;
}

const PingpongerSettingsPopup = ({
  active,
  handleClose,
  pingpongerSettings,
  setPingpongerSettings,
}: Props) => {
  const { t } = useTranslation();
  return (
    <PopupLayout $active={active} handleClose={handleClose}>
      <>
        <Typography.H3>{t("Settings.title")}</Typography.H3>
        <Row>
          <Typography.Text>{t("Settings.distanceSensorPort")}</Typography.Text>
          <Dropdown
            options={ports.map((el) => ({ id: el, text: el }))}
            currentOptionId={pingpongerSettings.distanceSensorPort}
            handleOptionSelect={(newOptionId) =>
              setPingpongerSettings((prev) => ({
                ...prev,
                distanceSensorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <Typography.Text>{t("Settings.leftMotorPort")}</Typography.Text>
          <Dropdown
            options={ports.map((el) => ({ id: el, text: el }))}
            currentOptionId={pingpongerSettings.leftMotorPort}
            handleOptionSelect={(newOptionId) =>
              setPingpongerSettings((prev) => ({
                ...prev,
                leftMotorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <Typography.Text>{t("Settings.rightMotorPort")}</Typography.Text>
          <Dropdown
            options={ports.map((el) => ({ id: el, text: el }))}
            currentOptionId={pingpongerSettings.rightMotorPort}
            handleOptionSelect={(newOptionId) =>
              setPingpongerSettings((prev) => ({
                ...prev,
                rightMotorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <Typography.Text>{t("Settings.isReversed")}</Typography.Text>
          <SwitchInput
            value={pingpongerSettings.isInverted}
            handleChange={() =>
              setPingpongerSettings((prev) => ({
                ...prev,
                isInverted: !pingpongerSettings.isInverted,
              }))
            }
          />
        </Row>
      </>
    </PopupLayout>
  );
};

const Row = styled.div`
  display: flex;
  column-gap: 15px;
  align-items: center;
`;

export default PingpongerSettingsPopup;
