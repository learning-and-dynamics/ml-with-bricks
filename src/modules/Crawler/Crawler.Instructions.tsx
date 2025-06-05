import { styled } from "styled-components";
import Typography from "../../components/Typography/Typography";
import { useTranslation } from "react-i18next";
import WarningBlock from "../../components/Warnings/WarningBlock";

const CrawlerInstructions = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Typography.Text $markdown>{t("CrawlerInstructions.paragraph1")}</Typography.Text>
      <Typography.Text $markdown>{t("CrawlerInstructions.paragraph2")}</Typography.Text>

      <Typography.H3>{t("CrawlerInstructions.step1.heading")}</Typography.H3>
      <Typography.Text $markdown>{t("CrawlerInstructions.step1.paragraph1")}</Typography.Text>
      <WarningBlock>{t("CrawlerInstructions.step1.warning")}</WarningBlock>
      <Typography.Text $markdown>{t("CrawlerInstructions.step1.paragraph2")}</Typography.Text>

      <Typography.H3>{t("CrawlerInstructions.step2.heading")}</Typography.H3>
      <Typography.Text $markdown>{t("CrawlerInstructions.step2.paragraph1")}</Typography.Text>
      <Typography.Text $markdown>{t("CrawlerInstructions.step2.paragraph2")}</Typography.Text>
      <Typography.Text $markdown>{t("CrawlerInstructions.step2.paragraph3")}</Typography.Text>
      <Typography.Text $markdown>{t("CrawlerInstructions.step2.paragraph4")}</Typography.Text>
      <Typography.Text $markdown>{t("CrawlerInstructions.step2.paragraph5")}</Typography.Text>
      <WarningBlock>{t("CrawlerInstructions.step2.warning1")}</WarningBlock>
      <WarningBlock>{t("CrawlerInstructions.step2.warning2")}</WarningBlock>
      
      <Typography.H3>{t("CrawlerInstructions.step3.heading")}</Typography.H3>
      <Typography.Text $markdown>{t("CrawlerInstructions.step3.paragraph1")}</Typography.Text>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default CrawlerInstructions;