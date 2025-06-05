import React from "react";
import styled from "styled-components";

interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

const Wrapper = styled.div`
  width: 1450px;
  max-width: 90vw;
  margin: 0 auto;
  flex: 1;
  /* height: auto; */

  @media (max-width: 1600px) {
    width: 1140px;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export default Container;
