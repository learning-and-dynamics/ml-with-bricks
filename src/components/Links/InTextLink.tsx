/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "styled-components";

interface Props {
  to: string;
  children: any;
  icon?: any;
}

const InTextLink = ({ to, children, icon }: Props) => {
  return (
    <Wrapper href={to} target="_blank" rel="noopener noreferrer">
      {!!icon && icon}
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.a`
  position: relative;
  display:  inline-flex;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    display: block;
    bottom: 2px;
    width: 100%;
    border-bottom: 2px dotted currentColor;
  }

  & > p {
    width: auto;
  }
`;
export default InTextLink;
