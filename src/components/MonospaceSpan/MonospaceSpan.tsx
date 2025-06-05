/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "styled-components";
import React from "react";

interface Props {
  children: React.ReactNode;
  $markdown?: boolean;
}

const MonospaceSpan = ({ children }: Props) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled.span`
  background-color: ${({ theme }) => theme.lightGray};
  border-radius: 5px;
  padding: 2px 5px;
  font-family: monospace;
`;

export default MonospaceSpan;
