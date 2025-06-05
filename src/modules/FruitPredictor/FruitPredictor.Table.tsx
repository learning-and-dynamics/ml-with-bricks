import { useTranslation } from "react-i18next";
import { useState } from "react";
import styled from "styled-components";
import Dropdown from "../../components/DropDown/DropDown";

interface FruitDropdownOption {
  id: string;
  text: string;
}

interface Props {
  data: Record<string, any>[];
  fruitDropDownOptions: FruitDropdownOption[];
  handleChangeLabel(id: string, newLabel: string): void;
  handleRemoveData: (id: string) => void;
  handleTableRowHover(id: string | null): void;
}

const FruitPredictorTable = ({
  data,
  fruitDropDownOptions,
  handleChangeLabel,
  handleRemoveData,
  handleTableRowHover,
}: Props) => {
  const { t } = useTranslation();
  const [currentDropdownId, setCurrentDropdownId] = useState<string | null>(
    null
  );

  return (
    <TableWrapper>
      <TableRow>
        {[t("FruitPredictor.yAxisTitle"), t("FruitPredictor.xAxisTitle"), t("FruitPredictor.label"), t("FruitPredictor.delete")].map(
          (col, index) => (
            <HeaderCell key={index}>{col}</HeaderCell>
          )
        )}
      </TableRow>
      <Body>
        {data.map((row) => (
          <TableRow
            key={row.id}
            onMouseEnter={() => handleTableRowHover(row.id)}
            onMouseLeave={() => handleTableRowHover(null)}
          >
            <TableCell>
              <p>{row.length}</p>
            </TableCell>
            <TableCell>
              <ColorBox $color={row.color} />
            </TableCell>
            <ClickableCell style={{ position: "relative" }}>
              <Dropdown
                options={fruitDropDownOptions}
                currentOptionId={row.label}
                handleOptionSelect={(newLabelId) => {
                  handleChangeLabel(row.id, newLabelId);
                  setCurrentDropdownId(null);
                }}
                opened={row.id === currentDropdownId}
                handleClick={() =>
                  setCurrentDropdownId(
                    currentDropdownId === row.id ? null : row.id
                  )
                }
              />
            </ClickableCell>
            <ClickableCell>
              <p onClick={() => handleRemoveData(row.id)}>🗑️</p>
            </ClickableCell>
          </TableRow>
        ))}
      </Body>
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  display: grid;
  border: 1px solid ${({ theme }) => theme.black};
  border-radius: 5px;
  /* overflow: hidden; */
  font-family: var(--main-font);
  font-size: 16px;
  font-weight: 400;
  position: relative;
`;

const HeaderCell = styled.span`
  display: table-header-group;
  vertical-align: middle;
  border-color: inherit;
  background-color: ${({ theme }) => theme.black};
  padding: 10px 15px;

  @media (max-width: 1600px) {
    padding: 10px 10px;
  }
  color: white;
  font-weight: 900;
`;

const TableRow = styled.div`
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  @media (max-width: 1600px) {
    grid-template-columns: 1fr 1fr 2fr 1fr;
  }
  /* border-bottom: 1px solid ${({ theme }) => theme.darkGray}; */

  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.gray};
  }

  &:nth-child(even) {
    background-color: "white";
  }
  &:last-of-type,
  &:first-of-type {
    border: none;
  }
`;

const Body = styled.div`
  overflow-y: auto;
  max-height: 300px;
  scroll-padding-bottom: 50px;
  margin: 1px 0;
  position: relative;
`;

const TableCell = styled.span`
  text-align: left;
  padding: 5px 15px;

  display: flex;
  align-items: center;
  justify-content: start;
`;

const ColorBox = styled.div<{ $color: number[] }>`
  width: 1px;
  border: 1px solid ${({ theme }) => theme.black};
  width: 20px;
  height: 20px;
  background-color: ${({ $color }) =>
    `rgb(255, ${($color[1] / 1024) * 255}, 0)`};
  border-radius: 5px;
`;

const ClickableCell = styled(TableCell)`
  & > p {
    cursor: pointer;
    display: inline-block;
  }
`;

export default FruitPredictorTable;
