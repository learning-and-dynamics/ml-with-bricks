import { useTranslation } from "react-i18next";
import Typography from "../../components/Typography/Typography"; // Assuming this path is correct for your project
import InTextLink from "../../components/Links/InTextLink";
import { styled } from "styled-components";

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Main Title */}
      <Typography.H1>{t("PrivacyPolicy.title")}</Typography.H1>
      <Typography.Text>{t("PrivacyPolicy.effectiveDate")}</Typography.Text>

      {/* Section 1: Data Protection at a Glance */}
      <Typography.H2>{t("PrivacyPolicy.section1.title")}</Typography.H2>
      <Typography.H3>
        {t("PrivacyPolicy.section1.generalNotes.heading")}
      </Typography.H3>
      <Typography.Text>
        {t("PrivacyPolicy.section1.generalNotes.paragraph1")}
      </Typography.Text>

      <Typography.H3>
        {t("PrivacyPolicy.section1.generalNotes.dataCollectionOnThisWebsite")}
      </Typography.H3>
      <Typography.Text $bold>
        {t("PrivacyPolicy.section1.generalNotes.whoResponsible")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section1.generalNotes.whoResponsibleAnswer")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section1.generalNotes.howDoWeCollect")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section1.generalNotes.howDoWeCollectAnswer")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section1.generalNotes.whatDoWeUseDataFor")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section1.generalNotes.whatDoWeUseDataForAnswer")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section1.generalNotes.yourRights")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section1.generalNotes.yourRightsAnswer")}
      </Typography.Text>

      {/* Section 2: Hosting (GitHub Pages) */}
      <Typography.H2>{t("PrivacyPolicy.section2.title")}</Typography.H2>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section2.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section2.paragraph2", {
          githubPagesDataCollection: (
            <InTextLink
              to={
                "https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection"
              }
            >
              GitHub
            </InTextLink>
          ),
        })}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section2.paragraph3")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section2.paragraph4")}
      </Typography.Text>
      <Typography.Text $bold>
        {t("PrivacyPolicy.section2.dataTransfer.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section2.dataTransfer.paragraph1")}
      </Typography.Text>

      {/* Section 3: General Information and Mandatory Disclosures */}
      <Typography.H2>{t("PrivacyPolicy.section3.title")}</Typography.H2>
      <Typography.Text $bold>
        {t("PrivacyPolicy.section3.dataProtection.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section3.dataProtection.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section3.responsibleParty.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section3.responsibleParty.paragraph1")}
      </Typography.Text>
      <ResponsiblePartyBlock>
        <Typography.Text $markdown>
          {"*" + "Viacheslav Sydora" + "*"}
        </Typography.Text>
        <Typography.Text $markdown>
          {"*" + "Max-Planck-Ring 4" + "*"}
        </Typography.Text>
        <Typography.Text $markdown>
          {"*" + "72070 Tübingen" + "*"}
        </Typography.Text>
        <Typography.Text $markdown>
          {"*" + t("PrivacyPolicy.section3.responsibleParty.country") + "*"}
        </Typography.Text>
      </ResponsiblePartyBlock>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section3.responsibleParty.email")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section3.responsibleParty.paragraph2")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section3.dataRetention.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section3.dataRetention.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section3.legalBasis.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section3.legalBasis.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section3.legalBasis.paragraph2")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section3.legalBasis.paragraph3")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section3.sslEncryption.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section3.sslEncryption.paragraph1")}
      </Typography.Text>

      {/* Section 4: Data Collection on This Website */}
      <Typography.H2>{t("PrivacyPolicy.section4.title")}</Typography.H2>
      <Typography.Text $bold>
        {t("PrivacyPolicy.section4.cookiesLocalStorage.heading")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section4.cookiesLocalStorage.paragraph1")}
      </Typography.Text>
      <ul>
        <Typography.Li $markdown>
          {t("PrivacyPolicy.section4.cookiesLocalStorage.listItem1")}
        </Typography.Li>
        <Typography.Li $markdown>
          {t("PrivacyPolicy.section4.cookiesLocalStorage.listItem2")}
        </Typography.Li>
      </ul>

      {t("PrivacyPolicy.section4.cookiesLocalStorage.importantInfo")}

      <ul>
        <Typography.Li $markdown>
          {t("PrivacyPolicy.section4.cookiesLocalStorage.listItem3")}
        </Typography.Li>
        <Typography.Li $markdown>
          {t("PrivacyPolicy.section4.cookiesLocalStorage.listItem4")}
        </Typography.Li>
        <Typography.Li $markdown>
          {t("PrivacyPolicy.section4.cookiesLocalStorage.listItem5")}
        </Typography.Li>
      </ul>
      <Typography.Text>
        {t("PrivacyPolicy.section4.cookiesLocalStorage.paragraph2")}
      </Typography.Text>
      {/* Section 5: Links to External Websites */}
      <Typography.H2>{t("PrivacyPolicy.section5.title")}</Typography.H2>
      <Typography.Text>
        {t("PrivacyPolicy.section5.paragraph1")}
      </Typography.Text>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section5.paragraph2")}
      </Typography.Text>

      {/* Section 6: Your Rights */}
      <Typography.H2>{t("PrivacyPolicy.section6.title")}</Typography.H2>
      <Typography.Text>
        {t("PrivacyPolicy.section6.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section6.rightToInformation.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section6.rightToInformation.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section6.rightToRectificationDeletion.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section6.rightToRectificationDeletion.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section6.rightToObject.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section6.rightToObject.paragraph1")}
      </Typography.Text>

      <Typography.Text $bold>
        {t("PrivacyPolicy.section6.rightToComplain.heading")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section6.rightToComplain.paragraph1")}
      </Typography.Text>
      <Typography.Text>
        {t("PrivacyPolicy.section6.rightToComplain.competentAuthority")}
      </Typography.Text>
      <ResponsiblePartyBlock>
        <Typography.Text $markdown>
          {"*" +
            t("PrivacyPolicy.section6.rightToComplain.authorityDetails.name") +
            "*"}
        </Typography.Text>
        <Typography.Text $markdown>
          {"*" +
            t("PrivacyPolicy.section6.rightToComplain.authorityDetails.address") +
            "*"}
        </Typography.Text>
        <Typography.Text $markdown>
          {"*" +
            t("PrivacyPolicy.section6.rightToComplain.authorityDetails.plzCity") +
            "*"}
        </Typography.Text>
        <Typography.Text $markdown>
          {"*" +
            t("PrivacyPolicy.section6.rightToComplain.authorityDetails.country") +
            "*"}
        </Typography.Text>
      </ResponsiblePartyBlock>
      <Typography.Text $markdown>
        {t("PrivacyPolicy.section6.rightToComplain.authorityDetails.email")}
      </Typography.Text>

      <Typography.Text $markdown>
        {t("PrivacyPolicy.section6.paragraph2")}
      </Typography.Text>

      {/* Section 7: Changes to This Privacy Policy */}
      <Typography.H2>{t("PrivacyPolicy.section7.title")}</Typography.H2>
      <Typography.Text>
        {t("PrivacyPolicy.section7.paragraph1")}
      </Typography.Text>
    </div>
  );
};

export default PrivacyPolicyPage;

const ResponsiblePartyBlock = styled.div`
  & > p {
    line-height: 1;
    /* margin: 0; */
  }
`;
