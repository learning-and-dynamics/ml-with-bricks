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
      {/* <div style={{ flex: 1, aspectRatio: "16/9" }}>
        <iframe
          style={{ borderWidth: 0 }}
          width="100%"
          height="100%"
          src="https://www.youtube-nocookie.com/embed/videoseries?si=o9tvPwSMyEbBw9rm&list=PLaA3pdUzmaV-oJ0QABOJssZ5MxFRIY_hu"
          title={t("Materials.CoursePlaylistTitle")}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div> */}
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
