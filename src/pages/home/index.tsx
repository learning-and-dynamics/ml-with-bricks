import { useTranslation } from "react-i18next";
import Typography from "../../components/Typography/Typography";
import ExperimentCard from "../../components/Cards/ExperimentCard";
import { styled } from "styled-components";
import PlaylistLink from "../../components/PlaylistLink/PlaylistLink";

const experiments = ["fruit-predictor", "pitcher", "crawler"];

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <Typography.H1>{t("Home.title")}</Typography.H1>
      <Typography.Text $markdown>{t("Home.paragraph1")}</Typography.Text>
      <Typography.Text $markdown>{t("Home.paragraph2")}</Typography.Text>

      <Typography.H3>{t("Home.experiments.heading")} 🧪</Typography.H3>
      <Typography.Text $markdown>{t("Home.experiments.paragraph")}</Typography.Text>
      <CardGrid>
        {experiments.map((el) => (
          <ExperimentCard key={el} expId={el} />
        ))}
      </CardGrid>
      <Typography.H3>{t("Home.courseRecording.heading")} 📹</Typography.H3>
      <Typography.Text $markdown>
        {t("Home.courseRecording.paragraph")}
      </Typography.Text>

      <PlaylistLink />

      <Typography.H3>{t("Home.courseMaterials.heading")} 📖</Typography.H3>
      <Typography.Text $markdown>
        {t("Home.courseMaterials.paragraph")}
      </Typography.Text>

      <Typography.H3>{t("Home.developers.heading")} ⌨️</Typography.H3>
      <Typography.Text $markdown>
        {t("Home.developers.paragraph")}
      </Typography.Text>

      <Typography.H3>{t("Home.troubleshooting.heading")} 🚧</Typography.H3>
      <Typography.Text $markdown>
        {t("Home.troubleshooting.paragraph")}
      </Typography.Text>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin: 20px 0;
  gap: 20px;
  grid-auto-rows: 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export default HomePage;
