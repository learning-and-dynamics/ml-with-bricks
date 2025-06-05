import React from "react";
import styled from "styled-components";
import { CrossIcon } from "../components/Icons/Icons";

interface Props {
  children: React.ReactElement;
  $active: boolean;
  handleClose: () => void;
}

const PopupLayout = ({ children, $active, handleClose }: Props) => (
  <Wrapper $active={$active}>
    <Content>
      <Main>{children}</Main>
      <Cross onClick={handleClose}>
        <CrossIcon />
      </Cross>
    </Content>
    <Darkener onClick={handleClose} />
  </Wrapper>
);

const Wrapper = styled.div<{ $active: boolean }>`
  visibility: hidden;
  opacity: 0;
  position: relative;
  z-index: 300;
  transition: 0.3s;

  ${({ $active }) =>
    $active &&
    `
      opacity: 1;
      visibility: visible;
    `}
`;

const Darkener = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.4);
`;

const Content = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  background: ${({ theme }: any) => theme.bodyBackground};
  border-radius: 10px;
  width: 630px;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 90vh;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    width: 75%;
    /* max-height: 90vh; */
  }

  @media (max-width: 500px) {
    width: 95%;
  }

  @media (max-height: 700px) {
    max-height: 95vh;
  }

  @media (max-height: 600px) {
    max-height: 90vh;
  }
`;

const Main = styled.div`
  position: relative;
  padding: 39px 30px 30px;
  background-color: #fff;

  @media (max-width: 400px) {
    padding: 25px 19px 19px;
  }

  @media (max-width: 350px) {
    padding: 21px 16px 16px;
  }
`;

const Cross = styled.div`
  position: absolute;
  top: 26px;
  right: 30px;
  /* padding: 13px; */
  background-color: #fff;
  border-radius: 50%;
  cursor: pointer;
  & > svg {
    fill: ${({ theme }) => theme.black};
    transition: all 0.2s ease-in-out;
    width: 24px;
    height: 24px;
  }

  /* 
  img {
    display: block;
    width: 14px;
  } */

  @media (max-width: 1200px) {
    padding: 11px;
    top: 20px;
    right: 28px;
  }

  @media (max-width: 500px) {
    padding: 10px;
    top: 18px;
    right: 26px;
  }

  @media (max-width: 400px) {
    top: 14px;
    right: 22px;
  }

  @media (max-width: 350px) {
    padding: 9px;
    top: 12px;
    right: 16px;
  }
`;

export default PopupLayout;
