import { styled } from "styled-components";
import Typography from "../../components/Typography/Typography";
import { useTranslation } from "react-i18next";

const FruitPredictorInstructions = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Typography.Text>
        {t("FruitPredictorInstructions.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.paragraph2")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("FruitPredictorInstructions.step1.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.step1.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.step1.paragraph2")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("FruitPredictorInstructions.step2.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.step2.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("FruitPredictorInstructions.step3.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.step3.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.step3.paragraph2")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("FruitPredictorInstructions.step4.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("FruitPredictorInstructions.step4.paragraph1")}
      </Typography.Text>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default FruitPredictorInstructions;
