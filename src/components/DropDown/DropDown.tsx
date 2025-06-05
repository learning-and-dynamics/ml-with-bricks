import { useEffect, useState } from "react";
import styled from "styled-components";
import { ChevronRightIcon } from "../Icons/Icons";

interface Option {
  id: string;
  text: string;
}

interface Props {
  options: Option[];
  currentOptionId: string;
  opened?: boolean;
  width?: string;
  handleOptionSelect(optionId: string): void;
  handleClick?(): void;
}

const Dropdown = ({
  options,
  currentOptionId,
  opened = undefined,
  width = "100%",
  handleOptionSelect,
  handleClick,
}: Props) => {
  const [isOpen, setOpen] = useState(false);

  const handleItemClick = (id: string) => {
    if (handleClick === undefined) setOpen(false);
    handleOptionSelect(id);
  };

  useEffect(() => {
    if (opened !== undefined) setOpen(opened);
  }, [opened]);

  const finalOpened = opened === undefined ? isOpen : opened;

  return (
    <Wrapper width={width}>
      <Header
        onClick={!!handleClick ? handleClick : () => setOpen((prev) => !prev)}
        $open={finalOpened}
      >
        {options.find((el) => el.id === currentOptionId)?.text || ""}
        <IconBlock $open={finalOpened}>
          <ChevronRightIcon />
        </IconBlock>
      </Header>
      <Body $open={finalOpened}>
        {options
          .filter((el) => el.id !== currentOptionId)
          .map((el) => (
            <Item
              key={el.id}
              onClick={() => handleItemClick(el.id)}
              $active={el.id === currentOptionId}
            >
              {el.text}
            </Item>
          ))}
      </Body>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ width: string }>`
  width: ${({ width }) => width};
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: white;
  position: relative;
  font-family: var(--main-font);
  font-size: 16px;
  max-width: 100%;
`;

const Header = styled.div<{ $open: boolean }>`
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  column-gap: 20px;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.darkGray};
  border-radius: 5px;
  border-bottom-right-radius: ${({ $open }) => ($open ? "0" : "5px")};
  border-bottom-left-radius: ${({ $open }) => ($open ? "0" : "5px")};
  border-bottom: 1px solid
    ${({ $open, theme }) => ($open ? "transparent" : theme.darkGray)};
`;

const Body = styled.ul<{ $open: boolean }>`
  border: 1px solid ${({ theme }) => theme.darkGray};
  display: ${({ $open }) => ($open ? "block" : "none")};
  position: absolute;
  background-color: white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  z-index: 100;
  width: 100%;
  margin: 0;
`;

const Item = styled.li<{ $active: boolean }>`
  padding: 5px 10px;
  list-style: none;

  border-bottom: 1px solid ${({ theme }) => theme.gray};
  font-weight: 600;
  &:last-of-type {
    border: none;
  }

  &:hover {
    cursor: pointer;
  }
`;

const IconBlock = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  & > svg {
    fill: ${({ theme }) => theme.darkGray};
    transition: all 0.2s ease-in-out;

    transform: ${({ $open }) => ($open ? "rotate(0deg)" : "rotate(90deg)")};
  }
`;

export default Dropdown;
