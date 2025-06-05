import { useState } from "react";
import styled from "styled-components";
import { ChevronRightIcon } from "../Icons/Icons";
import { useTranslation } from "react-i18next";

interface Props {
  width?: string;
}

const options = [
  { id: "en", text: "English" },
  { id: "de", text: "Deutsch" },
];

const LanguageDropdown = ({ width = "auto" }: Props) => {
  const [isOpen, setOpen] = useState(false);
  const { i18n } = useTranslation();

  const handleItemClick = (id: string) => {
    setOpen(false);
    i18n.changeLanguage(id); // Assuming option.id matches language code
  };

  const currentOptionText =
    options.find((el) => el.id === i18n.language)?.text || "";

  return (
    <Wrapper width={width}>
      <Header onClick={() => setOpen((prev) => !prev)} $open={isOpen}>
        {currentOptionText}
        <IconBlock $open={isOpen}>
          <ChevronRightIcon />
        </IconBlock>
      </Header>
      <Body $open={isOpen}>
        {options
          .filter((el) => el.id !== i18n.language)
          .map((el) => (
            <Item key={el.id} onClick={() => handleItemClick(el.id)}>
              {el.text}
            </Item>
          ))}
      </Body>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ width: string }>`
  width: ${({ width }) => width};
  background-color: white;
  position: relative;
  font-family: var(--main-font);
  font-size: 14px;
`;

const Header = styled.div<{ $open: boolean }>`
  padding: 3px 5px 3px 10px; /* Reduced padding */
  cursor: pointer;
  display: flex;
  column-gap: 10px; /* Reduced column gap */
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.gray}; /* Lighter border */
  border-radius: 3px; /* Smaller border radius */
`;

const Body = styled.ul<{ $open: boolean }>`
  border: 1px solid ${({ theme }) => theme.gray}; /* Lighter border */
  display: ${({ $open }) => ($open ? "block" : "none")};
  position: absolute;
  background-color: white;
  border-bottom-left-radius: 3px; /* Smaller border radius */
  border-bottom-right-radius: 3px; /* Smaller border radius */
  z-index: 100;
  width: 100%;
  margin-top: -1px; /* Align with header border */
`;

const Item = styled.li`
  padding: 3px 8px; /* Reduced padding */
  list-style: none;
  border-bottom: 1px solid ${({ theme }) => theme.gray}; /* Very light border */

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) =>
      theme.gray}; /* Subtle hover feedback */
  }
`;

const IconBlock = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  & > svg {
    fill: ${({ theme }) => theme.gray}; /* Muted icon color */
    transition: all 0.2s ease-in-out;
    width: 14px; /* Smaller icon */
    height: 14px; /* Smaller icon */
    transform: ${({ $open }) => ($open ? "rotate(0deg)" : "rotate(90deg)")};
  }
`;

export default LanguageDropdown;
