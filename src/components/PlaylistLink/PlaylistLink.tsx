/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "styled-components";
import Typography from "../Typography/Typography";
import { PlayIcon } from "../Icons/Icons";
import { useTranslation } from "react-i18next";

const PlaylistLink = () => {
  const { t } = useTranslation();
  return (
    <Wrapper
      href={
        "https://www.youtube.com/playlist?list=PLaA3pdUzmaV-oJ0QABOJssZ5MxFRIY_hu"
      }
      target="_blank"
    >
      <Vignette>
        <Row>
          <PlayIcon />
          <Typography.Text>{t("Home.courseRecording.watch")}</Typography.Text>
        </Row>
      </Vignette>
    </Wrapper>
  );
};

const Wrapper = styled.a`
  aspect-ratio: 16/9;
  width: 100%;

  background-image: url(thumbnail.jpg);
  background-size: cover;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 2px 0 #555;
`;

const Row = styled.div`
  display: flex;
  position: absolute;
  gap: 10px;

  & p {
    /* position: absolute; */
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
  }

  & > svg {
    height: 30px;
    width: 30px;
    position: relative;
    top: 2px;
  }
`;

const Vignette = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Darkening overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;

  & > div::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    transition: all 0.15s ease;
    background-color: #fff;
  }

  &:hover > div::after {
    width: 100%;
    background-color: #fff;
  }
`;

export default PlaylistLink;
