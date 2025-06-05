import { styled } from "styled-components";
import Typography from "../../components/Typography/Typography";
import { useTranslation } from "react-i18next";

const PitcherInstructions = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Typography.Text>{t("PitcherInstructions.paragraph1")}</Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.paragraph2")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PitcherInstructions.step1.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step1.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step1.paragraph2")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PitcherInstructions.step2.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step2.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PitcherInstructions.step3.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step3.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step3.paragraph2")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step3.paragraph3")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step3.paragraph4")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step3.paragraph5")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step3.paragraph6")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PitcherInstructions.step4.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PitcherInstructions.step4.paragraph1")}
      </Typography.Text>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default PitcherInstructions;
