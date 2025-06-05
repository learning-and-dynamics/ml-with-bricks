import React from "react";

import Header from "../components/Header/Header";
import Container from "../components/Container/Container";
import { ToastContainer } from "react-toastify";
import { styled } from "styled-components";
import Footer from "../components/Footer/Footer";

interface Props {
  children: React.ReactNode;
}

const PageLayout = ({ children }: Props) => {
  return (
    <Wrapper>
      <Header />
      <Container>{children}</Container>
      <ToastContainer />
      <Footer />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export default PageLayout;
