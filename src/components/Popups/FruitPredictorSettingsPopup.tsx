import React from "react";
import PopupLayout from "../../layouts/PopupLayout";
import { FruitPredictorSettings } from "../../types/types";
import { ports } from "../../consts/consts";
import Dropdown from "../DropDown/DropDown";
import Typography from "../Typography/Typography";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  active: boolean;
  handleClose: () => void;
  fruitPredictorSettings: FruitPredictorSettings;
  setFruitPredictorSettings: React.Dispatch<
    React.SetStateAction<FruitPredictorSettings>
  >;
}

const FruitPredictorSettingsPopup = ({
  active,
  handleClose,
  fruitPredictorSettings,
  setFruitPredictorSettings,
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
            currentOptionId={fruitPredictorSettings.distanceSensorPort}
            handleOptionSelect={(newOptionId) =>
              setFruitPredictorSettings((prev) => ({
                ...prev,
                distanceSensorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <Typography.Text>{t("Settings.colorSensorPort")}</Typography.Text>
          <Dropdown
            options={ports.map((el) => ({ id: el, text: el }))}
            currentOptionId={fruitPredictorSettings.colorSensorPort}
            handleOptionSelect={(newOptionId) =>
              setFruitPredictorSettings((prev) => ({
                ...prev,
                colorSensorPort: newOptionId,
              }))
            }
            width="100px"
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

export default FruitPredictorSettingsPopup;
