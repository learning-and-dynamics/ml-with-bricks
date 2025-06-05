import React from "react";
import PopupLayout from "../../layouts/PopupLayout";
import Dropdown from "../DropDown/DropDown";
import { ports } from "../../consts/consts";
import { CrawlerSettings } from "../../types/types";
import styled from "styled-components";
import Typography from "../Typography/Typography";
import { useTranslation } from "react-i18next";
import SliderInput from "../Inputs/SliderInput";

interface Props {
  active: boolean;
  handleClose: () => void;
  crawlerSettings: CrawlerSettings;
  setCrawlerSettings: React.Dispatch<React.SetStateAction<CrawlerSettings>>;
}

const CrawlerSettingsPopup = ({
  active,
  handleClose,
  crawlerSettings,
  setCrawlerSettings,
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
            currentOptionId={crawlerSettings.distanceSensorPort}
            handleOptionSelect={(newOptionId) =>
              setCrawlerSettings((prev) => ({
                ...prev,
                distanceSensorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <Typography.Text>{t("Settings.bigMotorPort")}</Typography.Text>
          <Dropdown
            options={ports.map((el) => ({ id: el, text: el }))}
            currentOptionId={crawlerSettings.bigMotorPort}
            handleOptionSelect={(newOptionId) =>
              setCrawlerSettings((prev) => ({
                ...prev,
                bigMotorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <Typography.Text>{t("Settings.smallMotorPort")}</Typography.Text>
          <Dropdown
            options={ports.map((el) => ({ id: el, text: el }))}
            currentOptionId={crawlerSettings.smallMotorPort}
            handleOptionSelect={(newOptionId) =>
              setCrawlerSettings((prev) => ({
                ...prev,
                smallMotorPort: newOptionId,
              }))
            }
            width="100px"
          />
        </Row>
        <Row>
          <SliderInput
            value={crawlerSettings.bigMotorSpeed}
            label={t("Settings.bigMotorSpeed")}
            minValue={5}
            maxValue={20}
            onChange={(newV) =>
              setCrawlerSettings((prev) => ({
                ...prev,
                bigMotorSpeed: newV,
              }))
            }
            writeValue
          />
        </Row>
        <Row>
          {/* <Typography.Text>{t("Settings.bigMotorSpeed")}</Typography.Text> */}
          <SliderInput
            value={crawlerSettings.smallMotorSpeed}
            label={t("Settings.smallMotorSpeed")}
            minValue={5}
            maxValue={20}
            onChange={(newV) =>
              setCrawlerSettings((prev) => ({
                ...prev,
                smallMotorSpeed: newV,
              }))
            }
            writeValue
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
  margin: 10px;
`;

export default CrawlerSettingsPopup;
