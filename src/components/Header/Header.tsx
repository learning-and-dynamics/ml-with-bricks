import styled from "styled-components";
import Container from "../Container/Container";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const Header = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
      <Container>
        <Row>
          <Link to="/">
            <LogoBox>
              <img
                src="brain.svg"
                alt="Machine Learning with LEGO® Bricks Logotype"
                className="logo_image"
                // position="relative"
                width={55}
                height={55}
                // unoptimized
              />
              
              <LogoText>
                {t("WebsiteName.ml")}
                <br />
                {t("WebsiteName.with_lego")}
              </LogoText>
            </LogoBox>
          </Link>
          <Navbar />
        </Row>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* background-color: lightgray; */
  width: 100%;
  position: relative;
  /* 
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background-color: black;
  } */
  /* &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #303030;
  } */
`;

const Row = styled.nav`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;

  @media (max-width: 600px) {
    padding: 10px 0;
  }
`;

const LogoBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 15px;
  margin: 10px 0;
  /* position: relative; */
  /* & > .logo_image {
    height: 100%;
  } */
`;

const LogoText = styled.p`
  font-family: var(--main-font);
  font-weight: 700;
  font-size: 24px;

  @media (max-width: 600px) {
    display: none;
  }
`;

export default Header;
