// import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Typography from "../../components/Typography/Typography";
import InTextLink from "../../components/Links/InTextLink";
import styled from "styled-components";
import PlaylistLink from "../../components/PlaylistLink/PlaylistLink";

const MaterialsPage = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <Typography.H1>{t("Materials.title")}</Typography.H1>
      <Typography.Text>{t("Materials.text")}</Typography.Text>
      <Typography.Text $bold>{t("Materials.Presentations")}: </Typography.Text>
      <BulletList>
        <li>
          <InTextLink to="./presentations/EN_Presentation.pdf">
            {t("Materials.Presentations.english")}
          </InTextLink>
        </li>
        <li>
          <InTextLink to="./presentations/DE_Presentation.pdf">
            {t("Materials.Presentations.german")}
          </InTextLink>
        </li>
      </BulletList>
      <Typography.Text $bold>{t("Materials.CoursePlaylist")}: </Typography.Text>
      <PlaylistLink />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const BulletList = styled.ul`
  & > li {
    margin-left: 15px;
  }
`;

export default MaterialsPage;
