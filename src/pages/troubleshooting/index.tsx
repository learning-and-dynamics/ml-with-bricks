import { useTranslation } from "react-i18next";
import Typography from "../../components/Typography/Typography";

const TroubleshootingPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Typography.H1>{t("Troubleshooting.title")}</Typography.H1>
      <Typography.Text $markdown>
        {t("Troubleshooting.paragraph")}
      </Typography.Text>
      <Typography.Text $bold>
        {t("Troubleshooting.question1.question")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("Troubleshooting.question1.paragraph1")}
      </Typography.Text>
      <Typography.Text $bold>
        {t("Troubleshooting.question2.question")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("Troubleshooting.question2.paragraph1")}
      </Typography.Text>
    </div>
  );
};

export default TroubleshootingPage;
