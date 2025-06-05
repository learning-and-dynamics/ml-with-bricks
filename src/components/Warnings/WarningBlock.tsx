/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "styled-components";
import { WarningIcon } from "../Icons/Icons";
import Typography from "../Typography/Typography";
import React from "react";

interface Props {
  children: React.ReactNode;
  $markdown?: boolean; 
}

const WarningBlock = ({ children }: Props) => {
  return (
    <Wrapper>
      <IconWrapper>
        <WarningIcon />
      </IconWrapper>
      <Typography.Text $markdown>{children}</Typography.Text>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: rgb(255, 250, 225);
  margin: 20px 0;
  border: 1px solid rgb(165, 140, 0);
  border-radius: 5px;
  padding: 5px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
`;

const IconWrapper = styled.div`
  width: 25px;
  height: 25px;

  & > svg {
    fill: rgb(165, 140, 0);
    width: 25px;
    height: 25px;
  }
`;

export default WarningBlock;
