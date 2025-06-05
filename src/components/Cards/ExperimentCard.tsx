/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "styled-components";
import Typography from "../Typography/Typography";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface Props {
  expId: string;
}

const ExperimentCard = ({ expId }: Props) => {
  const { t } = useTranslation();
  return (
    <Link to={`/experiments/${expId}`}>
      <Wrapper>
        {/* <Image
        src={`/experiments/${expId}.jpg`}
        // fill
        width={0}
        height={0}
        alt={expId}
        // objectFit="contain"
      /> */}
        <ImageDiv $expId={expId} />
        <InfoWrap>
          <Typography.H3>{t(`Experiments.${expId}.title` as never)}</Typography.H3>
          <Typography.Text>{t(`Experiments.${expId}.description` as never)}</Typography.Text>
        </InfoWrap>
      </Wrapper>
    </Link>
  );
};

const Wrapper = styled.div`
  width: 100%;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 1px solid black;
  cursor: pointer;
  transition: all 0.15s ease;

  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
  }
  height: 100%;
`;

const ImageDiv = styled.div<{ $expId: string }>`
  width: 100%;
  aspect-ratio: 4/3;
  background-image: ${({ $expId }) => `url(experiments/${$expId}.webp)`};
  background-size: cover;
  background-position: center;
  margin: 0;
  border-bottom: 1px solid ${({ theme }) => theme.black};
`;

const InfoWrap = styled.div`
  padding: 0 15px 10px;
`;

export default ExperimentCard;
