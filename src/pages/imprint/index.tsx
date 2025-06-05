// import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Typography from "../../components/Typography/Typography";
import { styled } from "styled-components";

const ImprintPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Typography.H1>{t("Imprint.title")}</Typography.H1>
      <ResponsiblePartyBlock>
        <Typography.Text $markdown>{"Viacheslav Sydora"}</Typography.Text>
        <Typography.Text $markdown>{"Max-Planck-Ring 4"}</Typography.Text>
        <Typography.Text $markdown>{"72070 Tübingen"}</Typography.Text>
        <Typography.Text $markdown>
          {t("PrivacyPolicy.section3.responsibleParty.country")}
        </Typography.Text>
      </ResponsiblePartyBlock>
      <Typography.H2>{t("Imprint.contact.heading")}</Typography.H2>
      <Typography.Text $markdown>{t("Imprint.contact.email")}</Typography.Text>
      <Typography.Text $markdown>{t("Imprint.contact.phone")}</Typography.Text>
      <Typography.H2>{t("Imprint.euDisputeResolution.heading")}</Typography.H2>
      <Typography.Text $markdown>
        {t("Imprint.euDisputeResolution.paragraph1")}
      </Typography.Text>
      <Typography.H2>
        {t("Imprint.consumerDisputeResolution.heading")}
      </Typography.H2>
      <Typography.Text $markdown>
        {t("Imprint.consumerDisputeResolution.paragraph1")}
      </Typography.Text>
    </div>
  );
};

export default ImprintPage;

const ResponsiblePartyBlock = styled.div`
  & > p {
    line-height: 1;
  }
`;
